package no.nav.data.team.po;

import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.team.domain.Role;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class ProductAreaMemberAccumulator {

    private final Map<String,Item> members;

    private ProductAreaMemberAccumulator() {
        this.members = new HashMap<>();
    }


    private synchronized void accumulateMemberRole(String memberNavident, Role memberRole){
        var maybeMember = this.members.get(memberNavident);
        if(maybeMember == null){
            var newItem = new Item(null,Set.of(memberRole));
            this.members.put(memberNavident, newItem);
        }else{
            var item = this.members.get(memberNavident);
            item.roles.add(memberRole);
        }
    }

    private void accumulateMemberRole(String memberNavident, List<Role> memberRole){
        for(var role : memberRole){
            accumulateMemberRole(memberNavident, role);
        }
    }


    public static ProductAreaMemberAccumulator accumulate(
            Original original,
            Updated updated,
            Organizational organizational
    ) {

        if(organizational == null){
            throw new IllegalStateException("Cannot update when org data is unavailable");
//            return accumulateWithoutOrg(original, updated);
        }else{
            return accumulateWithOrg(original,updated,organizational);
        }

    }

    private static ProductAreaMemberAccumulator accumulateWithOrg(Original original, Updated updated, Organizational organizational){

        var ledereToRoleMap = organizational.ledereToOrgNamesMap.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, entry -> {
            var orgenhetNavnList = entry.getValue();
            var isFagdirektor = orgenhetNavnList.stream().anyMatch(it -> it.toLowerCase().startsWith("fagdirektør"));
            var isPersonalOgBemanningsAnsvarlig = orgenhetNavnList.stream().anyMatch(it -> it.toLowerCase().startsWith("kompetanse"));
            return isFagdirektor ? Role.DISCIPLINE_DIRECTOR : isPersonalOgBemanningsAnsvarlig ? Role.PERSONELLROSTER_RESPONSIBLE : Role.DISCIPLINE_AND_DELIVERY_MANAGER;
        }));


        var out = new ProductAreaMemberAccumulator();

        if(updated.memberList == null){
            out.accumulateMemberRoleList(original.memberList);
            out.purgeMemberRoles(Role.getLeadergroupRoles());
        }else{
            out.accumulateMemberRoleList(updated.memberList);
        }

        out.accumulateMemberRole(organizational.lederNavIdent, Role.LEADER);

        for (Map.Entry<String, Role> entry : ledereToRoleMap.entrySet()) {
            String navident = entry.getKey();
            Role role = entry.getValue();
            var gotLeder = organizational.lederNavIdent.equals(navident);
            if (!gotLeder) {
                out.accumulateMemberRole(navident, role);
            }
        }

        for (String customOwnerNavIdent : updated.ownerGroupList()) {
            if (ledereToRoleMap.containsKey(customOwnerNavIdent)) {
                throw new IllegalArgumentException("Cannot add custom owner " + customOwnerNavIdent + " when this navident is already owner through organization structure");
            }
            out.accumulateMemberRole(customOwnerNavIdent, Role.DISCIPLINE_AND_DELIVERY_MANAGER);
        }


        return out;
    }

    private void purgeMemberRoles(List<Role> leadergroupRoles) {
        this.members.values().forEach(item -> {
            item.roles.removeAll(leadergroupRoles);
        });
    }

    private static ProductAreaMemberAccumulator accumulateWithoutOrg(Original original, Updated updated){
        var out = new ProductAreaMemberAccumulator();

        if(updated.memberList == null){
            out.accumulateMemberRoleList(original.memberList);
        }else{
            var originalLeaders = original.memberList.stream().filter(it -> it.getRoles().stream().anyMatch(Role::isLeaderGroupRole)).toList();
            out.accumulateMemberRoleList(originalLeaders);
            out.purgeMemberRoles(Role.getNonLeadergroupRoles());
            out.accumulateMemberRoleList(updated.memberList);
        }

        return out;
    }

    private void accumulateMemberRoleList(List<PaMember> memberList) {
        for(var member : memberList){
            this.accumulateMemberRole(member.getNavIdent(),member.getRoles());
            var descriptionTarget = this.members.get(member.getNavIdent());
            descriptionTarget.description = member.getDescription();
        }

    }

    public List<PaMember> membersToPersist() {

        var tmp = this.members.entrySet().stream()
                .map(itemEntry -> new PaMember(itemEntry.getKey(), itemEntry.getValue().roles.stream().toList(), itemEntry.getValue().description))
                .filter(it -> !it.getRoles().isEmpty())
                .toList();
        return new ArrayList<>(tmp);
    }

    private static final class Item {
        private String description;
        private final Set<Role> roles;

        public Item(String description, Set<Role> roles) {
            this.roles = new HashSet<>(roles);
            this.description = description;
        }
    }

    public record Original(List<PaMember> memberList, List<String> ownerGroupList){}
    public record Updated(List<PaMember> memberList, List<String> ownerGroupList){
        public Updated(List<PaMember> memberList, List<String> ownerGroupList){
            this.memberList = memberList;
            this.ownerGroupList = ownerGroupList == null ? List.of() : ownerGroupList;
            if(this.memberList != null){
                var membersWithLeaderGroupRoles = this.memberList().stream().filter(x -> x.getRoles().stream().anyMatch(Role::isLeaderGroupRole)).toList();
                if(!membersWithLeaderGroupRoles.isEmpty()){
                    var culprits = membersWithLeaderGroupRoles.stream().map(PaMember::getNavIdent).collect(Collectors.joining(", "));
                    throw new IllegalArgumentException("Cannot assign leader roles for regular members: " + culprits);
                }
            }
        }
    }

    public record Organizational(String lederNavIdent, Map<String, List<String>> ledereToOrgNamesMap) {
        public Organizational {
            assertAllLedereInMap(lederNavIdent, ledereToOrgNamesMap);
        }

        private static void assertAllLedereInMap(String lederNavident, Map<String, List<String>> ledereOrgEnhetNavnMap) {
            var hasKey = ledereOrgEnhetNavnMap.containsKey(lederNavident);
            var hasValue = ledereOrgEnhetNavnMap.get(lederNavident) != null;
            var hasNames = hasValue && !ledereOrgEnhetNavnMap.get(lederNavident).isEmpty();
            var isOk = hasKey && hasValue && hasNames;
            if(!isOk){
                // todo, check if necessary..
//                throw new IllegalArgumentException("Missing orgenhetNavn for " + lederNavident);
            }
        }
    }


}
