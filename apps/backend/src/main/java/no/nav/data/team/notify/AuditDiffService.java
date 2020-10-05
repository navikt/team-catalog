package no.nav.data.team.notify;

import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.Notification.NotificationChannel;
import no.nav.data.team.notify.domain.Notification.NotificationType;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.team.notify.domain.TeamAuditMetadata;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.find;
import static no.nav.data.common.utils.StreamUtils.tryFind;
import static no.nav.data.common.utils.StreamUtils.union;

@Slf4j
@Service
public class AuditDiffService {

    private final AuditVersionRepository auditVersionRepository;

    public AuditDiffService(AuditVersionRepository auditVersionRepository) {
        this.auditVersionRepository = auditVersionRepository;
    }

    public List<NotificationTask> createTask(List<AuditMetadata> audits, List<Notification> notifications) {
        var allTasks = new ArrayList<NotificationTask>();

        var lastAudit = audits.get(audits.size() - 1);
        var auditsStart = audits.get(0).getTime();
        var auditsEnd = lastAudit.getTime();
        log.info("Notification {} audits", audits.size());

        var teamsPrev = auditVersionRepository.getTeamMetadataBefore(auditsStart);
        var teamsCurr = auditVersionRepository.getTeamMetadataBetween(auditsStart, auditsEnd);
        notifications = expandProductAreaNotifications(notifications, teamsPrev, teamsCurr);
        var auditsByTargetId = audits.stream().collect(groupingBy(AuditMetadata::getTableId));
        notifications.removeIf(n -> {
                    boolean notAllEventNotification = n.getType() != NotificationType.ALL_EVENTS;
                    boolean noAuditsForNotification = !auditsByTargetId.containsKey(n.getTarget());
                    boolean noDependentAuditsForNotification = auditsByTargetId.keySet().stream().noneMatch(n::isDependentOn);
                    return notAllEventNotification && noAuditsForNotification && noDependentAuditsForNotification;
                }
        );
        notifications.forEach(n -> {
            if (n.getTarget() != null && !auditsByTargetId.containsKey(n.getTarget())) {
                log.info("Adding empty audits for target {}", n.getTarget());
                auditsByTargetId.put(n.getTarget(), List.of());
            }
        });

        var notificationsByIdent = notifications.stream().collect(groupingBy(Notification::getIdent));
        log.info("Notification for {}", notificationsByIdent.keySet());
        for (Entry<String, List<Notification>> entry : notificationsByIdent.entrySet()) {
            String ident = entry.getKey();
            List<Notification> notificationsForIdent = entry.getValue();
            var notificationTargetAudits = unpackAndGroupTargets(notificationsForIdent, auditsByTargetId);
            var tasksForIdent = createTasks(ident, notificationTargetAudits);
            allTasks.addAll(tasksForIdent);
        }
        return allTasks;
    }

    private List<Notification> expandProductAreaNotifications(List<Notification> notifications, List<TeamAuditMetadata> teamsPrev, List<TeamAuditMetadata> teamsCurr) {
        var allNotifications = new ArrayList<>(notifications);
        for (Notification notification : notifications) {
            if (notification.getType() == NotificationType.PA) {
                var paTeamsPrev = filter(teamsPrev, t -> notification.getTarget().equals(t.getProductAreaId()));
                var paTeamsCurr = filter(teamsCurr, t -> notification.getTarget().equals(t.getProductAreaId()));
                var allTeams = union(paTeamsPrev, paTeamsCurr).stream().map(TeamAuditMetadata::getTableId).distinct().collect(toList());
                // Adding teams from product area to notifications, setting their level as Product area, to enforce correct channel overrides later
                allNotifications.addAll(convert(allTeams, teamId -> Notification.builder()
                        .type(NotificationType.PA)
                        .time(notification.getTime())
                        .ident(notification.getIdent())
                        .channels(notification.getChannels())
                        .target(teamId)
                        .build()));
                notification.setDependentTargets(allTeams);
                log.info("Notification PA {} DependentTargets {}", notification.getTarget(), allTeams);
            }
        }
        return allNotifications;
    }

    private List<NotificationTargetAudits> unpackAndGroupTargets(List<Notification> notifications, Map<UUID, List<AuditMetadata>> auditsByTargetId) {
        var allEventAudits = new ArrayList<NotificationTargetAudits>();
        // unpack ALL_EVENTS
        tryFind(notifications, n -> n.getType() == NotificationType.ALL_EVENTS)
                .ifPresent(n -> allEventAudits.addAll(convert(auditsByTargetId.entrySet(), e -> new NotificationTargetAudits(n, e.getKey(), e.getValue()))));

        var targetAudits = notifications.stream()
                .filter(n -> n.getType() != NotificationType.ALL_EVENTS)
                .map(n -> new NotificationTargetAudits(n, n.getTarget(), auditsByTargetId.get(n.getTarget())))
                .collect(toList());
        return union(allEventAudits, targetAudits);
    }

    private List<NotificationTask> createTasks(String ident, List<NotificationTargetAudits> targetAudits) {
        // All times are equal down here
        var time = targetAudits.get(0).getNotification().getTime();

        // Calculate which type is the most specific for each target.
        // ie. if a a user has a team marked as a different channel than it's product area, we will use the teams channel settings for that target, same goes for ALL_EVENTS.
        Map<UUID, NotificationType> targetTypes = new HashMap<>();
        targetAudits.forEach(ta -> targetTypes.compute(ta.getTargetId(), (uuid, existingType) -> NotificationType.min(ta.getNotification().getType(), existingType)));

        var classifications = Stream.of(NotificationChannel.values()).map(TargetClassification::new).collect(toList());

        targetAudits.forEach(ta -> {
            Notification notification = ta.getNotification();
            UUID targetId = ta.getTargetId();

            var notificationTypeForTarget = targetTypes.get(targetId);
            var silent = notificationTypeForTarget != notification.getType();

            filter(classifications, c -> c.matches(notification.getChannels()))
                    .forEach(c -> c.add(new Target(targetId, ta.getAudits(), silent)));
        });

        return classifications.stream()
                .filter(c -> c.getTargets().stream().anyMatch(t -> !t.isSilent()))
                .map(classification ->
                        NotificationTask.builder()
                                .ident(ident)
                                .time(time)
                                .channel(classification.getChannel())
                                .targets(convertAuditTargets(ident, classification.getTargets()))
                                .build()
                )
                .collect(toList());
    }

    private List<AuditTarget> convertAuditTargets(String ident, List<Target> targets) {
        return convert(targets, target -> {
            var targetId = target.getTarget();
            var audits = target.getAudits();
            AuditMetadata oldestAudit;
            UUID prev;
            UUID curr;
            if (audits.isEmpty()) {
                // If the target in question has not actually changed, ie. a team added/removed in a product area
                oldestAudit = auditVersionRepository.lastAuditForObject(targetId);
                prev = oldestAudit.getId();
                curr = oldestAudit.getId();
            } else {
                oldestAudit = audits.get(0);
                var newestAudit = audits.get(audits.size() - 1);
                prev = getPreviousFor(oldestAudit);
                curr = newestAudit.getAction() == Action.DELETE ? null : newestAudit.getId();
            }
            var tableName = oldestAudit.getTableName();
            log.info("Notification to {} target {}: {} from {} to {}", ident, tableName, targetId, prev, curr);
            return AuditTarget.builder()
                    .targetId(targetId)
                    .type(tableName)
                    .prevAuditId(prev)
                    .currAuditId(curr)
                    .silent(target.isSilent())
                    .build();
        });
    }

    private UUID getPreviousFor(AuditMetadata oldestAudit) {
        if (oldestAudit.getAction() == Action.CREATE) {
            return null;
        }
        return UUID.fromString(auditVersionRepository.getPreviousAuditIdFor(oldestAudit.getId()));
    }

    @Value
    static class NotificationTargetAudits {

        Notification notification;
        UUID targetId;
        List<AuditMetadata> audits;
    }

    @Value
    static class TargetClassification {

        NotificationChannel channel;
        List<Target> targets = new ArrayList<>();
        Set<UUID> targetsAdded = new HashSet<>();

        TargetClassification(NotificationChannel channel) {
            this.channel = channel;
        }

        boolean isAdded(UUID targetId) {
            return targetsAdded.contains(targetId);
        }

        void add(Target target) {
            if (isAdded(target.getTarget())) {
                if (!target.isSilent()) {
                    var existingTarget = find(targets, t -> t.getTarget().equals(target.getTarget()));
                    if (existingTarget.isSilent()) {
                        targets.remove(existingTarget);
                        targets.add(target);
                    }
                }
            } else {
                targetsAdded.add(target.getTarget());
                targets.add(target);
            }
        }

        boolean matches(List<NotificationChannel> channels) {
            return channels.contains(channel);
        }
    }

    @Value
    static class Target {

        UUID target;
        List<AuditMetadata> audits;
        boolean silent;
    }
}
