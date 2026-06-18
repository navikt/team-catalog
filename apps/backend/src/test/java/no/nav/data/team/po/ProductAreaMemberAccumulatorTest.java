package no.nav.data.team.po;

import com.google.common.collect.Streams;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.team.domain.Role;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.BDDAssertions.as;

class ProductAreaMemberAccumulatorTest {

    static final String LEDER_NAV_IDENT = "a900001";
    static final String LEDER_NAV_IDENT_SECOND = "a900002";
    static final String ORGENHET1_NAVN = "FOLK";

    static final PaMember LEDER_MEMBER = new PaMember(LEDER_NAV_IDENT,List.of(Role.LEADER),null);

    static final List<PaMember> ORIGINAL_MEMBERS = List.of(new PaMember("a999001", List.of(Role.DEVELOPER), null));

    static final List<PaMember> ORIGINAL_MEMBERS_PLUS_ONE = Streams.concat(ORIGINAL_MEMBERS.stream(), Stream.of(new PaMember("a999002", List.of(Role.DESIGN_LEAD), null))).toList();

    static final List<PaMember> ONLY_NEW_MEMBERS = Stream.of(new PaMember("a999002", List.of(Role.DESIGN_LEAD), null)).toList();

    static final Map<String,List<String>> ONLY_LEDER_ORGNAME_MAP = Map.of(LEDER_NAV_IDENT,List.of(ORGENHET1_NAVN));

    static final Map<String, List<String>> OWNERGROUP_NAVIDENT_ORGNAME_MAP = Map.of(
            LEDER_NAV_IDENT, List.of("leder enhet"),
            "a910001", List.of("fagdirektør blabla"),
            "a910002", List.of("Kompetanse gruppe"),
            "a910003", List.of("enhet 3"),
            "a910004", List.of("enhet 4")

    );

    static final ProductAreaMemberAccumulator.Organizational LEDER_ONLY_ORGANIZATIONAL = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT,ONLY_LEDER_ORGNAME_MAP);

    static final ProductAreaMemberAccumulator.Organizational FULL_ORGANIZATIONAL = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT, OWNERGROUP_NAVIDENT_ORGNAME_MAP);


    static final List<String> CUSTOM_OWNER_GROUP_MEMBERS = List.of("a920001", "a920002", "a920003");


    @Test
    void atLeastGetTheLeder(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), List.of());

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original,updated,LEDER_ONLY_ORGANIZATIONAL).membersToPersist();
        Assertions.assertThat(membersToPersist).contains(LEDER_MEMBER).hasSize(1);
    }

    @Test
    void updatedMembersSetToNullPreservesOriginalMembers(){
        var original = new ProductAreaMemberAccumulator.Original(ORIGINAL_MEMBERS, List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(null, List.of());

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original,updated,LEDER_ONLY_ORGANIZATIONAL).membersToPersist();
        Assertions.assertThat(membersToPersist).containsAll(ORIGINAL_MEMBERS).contains(LEDER_MEMBER).hasSize(2);

    }

    @Test
    void replacingWithOrignalPlusOneNewMember(){
        var original = new ProductAreaMemberAccumulator.Original(ORIGINAL_MEMBERS, List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(ORIGINAL_MEMBERS_PLUS_ONE, List.of());

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original,updated,LEDER_ONLY_ORGANIZATIONAL).membersToPersist();
        Assertions.assertThat(membersToPersist).containsAll(ORIGINAL_MEMBERS_PLUS_ONE).hasSize(3).contains(LEDER_MEMBER);


    }


    @Test
    void replaceOldMembersWithNew() {
        var original = new ProductAreaMemberAccumulator.Original(ORIGINAL_MEMBERS, List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(ONLY_NEW_MEMBERS, List.of());

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, LEDER_ONLY_ORGANIZATIONAL).membersToPersist();
        Assertions.assertThat(membersToPersist).containsAll(ONLY_NEW_MEMBERS).hasSize(2).contains(LEDER_MEMBER);
    }


    @Test
    void ownerGroupOk(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), List.of());

        var org = new ProductAreaMemberAccumulator.Organizational(
                LEDER_NAV_IDENT,
                OWNERGROUP_NAVIDENT_ORGNAME_MAP
        );

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).membersToPersist();
        Assertions.assertThat(membersToPersist).hasSize(5).contains(LEDER_MEMBER);
        Assertions.assertThat(membersToPersist.stream().map(PaMember::getNavIdent)).containsAll(OWNERGROUP_NAVIDENT_ORGNAME_MAP.keySet());

    }



    @Test
    void organizationalOwnerGroupAndNotOverlappingNewMembers(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(ORIGINAL_MEMBERS_PLUS_ONE, List.of());

        var org = new ProductAreaMemberAccumulator.Organizational(
                LEDER_NAV_IDENT,
                OWNERGROUP_NAVIDENT_ORGNAME_MAP
        );

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).membersToPersist();
        Assertions.assertThat(membersToPersist).hasSize(7).contains(LEDER_MEMBER).containsAll(ORIGINAL_MEMBERS_PLUS_ONE);
        Assertions.assertThat(membersToPersist.stream().map(PaMember::getNavIdent)).containsAll(OWNERGROUP_NAVIDENT_ORGNAME_MAP.keySet());
    }

    @Test
    void customOwnerGroupMembers(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), CUSTOM_OWNER_GROUP_MEMBERS);

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, LEDER_ONLY_ORGANIZATIONAL).membersToPersist();
        Assertions.assertThat(membersToPersist).hasSize(4).contains(LEDER_MEMBER);
        Assertions.assertThat(membersToPersist.stream().map(PaMember::getNavIdent)).containsAll(CUSTOM_OWNER_GROUP_MEMBERS);
    }

    @Test
    void filterOutOverlapBetweenOrgOwnerGroupAndCustomOwnerGroup() {
        // a910001 er i org-strukturen med DISCIPLINE_DIRECTOR-rollen (fagdirektør)
        var overlappingNavIdent = "a910001";

        var ownerGroupMembers = new ArrayList<>(CUSTOM_OWNER_GROUP_MEMBERS);
        ownerGroupMembers.add(overlappingNavIdent);

        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), ownerGroupMembers);
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var org = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT, OWNERGROUP_NAVIDENT_ORGNAME_MAP);

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).membersToPersist();

        // overlappende navident beholder org-rollen (DISCIPLINE_DIRECTOR), ikke DISCIPLINE_AND_DELIVERY_MANAGER fra custom-lista
        Assertions.assertThat(membersToPersist.stream().map(PaMember::getNavIdent))
                .contains(overlappingNavIdent);
        var overlappingMember = membersToPersist.stream()
                .filter(m -> m.getNavIdent().equals(overlappingNavIdent))
                .findFirst().get();
        Assertions.assertThat(overlappingMember.getRoles())
                .containsExactly(Role.DISCIPLINE_DIRECTOR);

        // de custom ownerne som ikke overlapper er fortsatt lagt til
        Assertions.assertThat(membersToPersist.stream().map(PaMember::getNavIdent))
                .containsAll(CUSTOM_OWNER_GROUP_MEMBERS);
    }

    @Test
    void ownerGroupToPersistExcludesNavidentAlreadyOwnerThroughOrg() {
        // a910001 er allerede owner gjennom org-strukturen (fagdirektør) og skal derfor ut av owner group-lista
        var overlappingNavIdent = "a910001";

        var ownerGroupMembers = new ArrayList<>(CUSTOM_OWNER_GROUP_MEMBERS);
        ownerGroupMembers.add(overlappingNavIdent);

        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), ownerGroupMembers);
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var org = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT, OWNERGROUP_NAVIDENT_ORGNAME_MAP);

        var ownerGroupToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).ownerGroupToPersist();

        // navidenten som allerede er owner via org er filtrert helt bort fra lagret owner group
        Assertions.assertThat(ownerGroupToPersist).doesNotContain(overlappingNavIdent);
        // de custom ownerne som ikke overlapper beholdes
        Assertions.assertThat(ownerGroupToPersist).containsExactlyInAnyOrderElementsOf(CUSTOM_OWNER_GROUP_MEMBERS);
    }


    @Test
    void allowCustomOwnerGroupMemberToHaveNormalRoleAlso(){
        var bothMemberNavIdent = CUSTOM_OWNER_GROUP_MEMBERS.getFirst();
        var bothMember = new PaMember(bothMemberNavIdent,List.of(Role.DESIGNER),null);

        var updated = new ProductAreaMemberAccumulator.Updated(List.of(bothMember), CUSTOM_OWNER_GROUP_MEMBERS);
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, LEDER_ONLY_ORGANIZATIONAL).membersToPersist();

        Assertions.assertThat(membersToPersist).hasSize(4).contains(LEDER_MEMBER);
        Assertions.assertThat(membersToPersist).filteredOn(x -> x.getNavIdent().equals(bothMemberNavIdent))
                .singleElement()
                .extracting(PaMember::getRoles, as(InstanceOfAssertFactories.list(Role.class)))
                .contains(Role.DESIGNER, Role.DISCIPLINE_AND_DELIVERY_MANAGER)
                .hasSize(2);
    }

    @Test
    void allowOrgwnerGroupMemberToHaveNormalRoleAlso(){
        var bothMemberLederNavIdent = OWNERGROUP_NAVIDENT_ORGNAME_MAP.keySet().stream().filter(it -> it.equals(LEDER_NAV_IDENT)).findFirst().get(); // skip leader
        var bothMemberNavIdent = OWNERGROUP_NAVIDENT_ORGNAME_MAP.keySet().stream().filter(it -> it.equals("a910001")).findFirst().get(); // skip leader
        var bothMember = new PaMember(bothMemberNavIdent,List.of(Role.DESIGNER),null);
        var bothMemberLeder = new PaMember(bothMemberLederNavIdent,List.of(Role.LEGAL_ADVISER),null);

        var updated = new ProductAreaMemberAccumulator.Updated(List.of(bothMember, bothMemberLeder), CUSTOM_OWNER_GROUP_MEMBERS);
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, FULL_ORGANIZATIONAL).membersToPersist();

        Assertions.assertThat(membersToPersist).hasSize(8);

        Assertions.assertThat(membersToPersist).filteredOn(paMember -> paMember.getNavIdent().equals(bothMemberNavIdent))
                .singleElement()
                .extracting(PaMember::getRoles, as(InstanceOfAssertFactories.list(Role.class)))
                .containsExactlyInAnyOrder(Role.DESIGNER, Role.DISCIPLINE_DIRECTOR)
                .hasSize(2);

        Assertions.assertThat(membersToPersist).filteredOn(paMember -> paMember.getNavIdent().equals(bothMemberLederNavIdent))
                .singleElement()
                .extracting(PaMember::getRoles, as(InstanceOfAssertFactories.list(Role.class)))
                .containsExactlyInAnyOrder(Role.LEADER, Role.LEGAL_ADVISER)
                .hasSize(2);

    }

    @Test
    void handleChangeOfLeaderInOrganization(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(PaMember.builder().navIdent(LEDER_NAV_IDENT).role(Role.LEADER).build()), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(null, List.of());

        var org = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT_SECOND,Map.of());

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).membersToPersist();
        Assertions.assertThat(membersToPersist).hasSize(1).contains(PaMember.builder().navIdent(LEDER_NAV_IDENT_SECOND).role(Role.LEADER).build());
    }

    @Test
    void handleChangeOfLeaderWithAdditionalRoleInOrganization(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(PaMember.builder().navIdent(LEDER_NAV_IDENT).role(Role.LEADER).build()), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(List.of(PaMember.builder().navIdent(LEDER_NAV_IDENT).role(Role.LEGAL_ADVISER).build()), List.of());

        var org = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT_SECOND,Map.of());

        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).membersToPersist();
        Assertions.assertThat(membersToPersist).hasSize(2).contains(
                PaMember.builder().navIdent(LEDER_NAV_IDENT_SECOND).role(Role.LEADER).build(),
                PaMember.builder().navIdent(LEDER_NAV_IDENT).role(Role.LEGAL_ADVISER).build()
        );
    }

    @Test
    void handleOwnerGroupSubtraction(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of("a930001", "a930002"));
        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), List.of("a930001"));

        var org = new ProductAreaMemberAccumulator.Organizational(LEDER_NAV_IDENT_SECOND,Map.of());
        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, org).membersToPersist();
        Assertions.assertThat(membersToPersist).hasSize(2).filteredOn(x -> !x.getRoles().contains(Role.LEADER)).hasSize(1).contains(
                new PaMember("a930001", List.of(Role.DISCIPLINE_AND_DELIVERY_MANAGER), null)
        );
    }

    @Test
    void throwIfRegularMembersHaveLeaderRoles(){
        var illegalArgumentException = Assertions.catchThrowableOfType(IllegalArgumentException.class,()->{
            var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
            var updated = new ProductAreaMemberAccumulator.Updated(List.of(PaMember.builder().navIdent("don'tcare").role(Role.LEADER).build()), List.of());
            ProductAreaMemberAccumulator.accumulate(original, updated, FULL_ORGANIZATIONAL).membersToPersist();
        });
        Assertions.assertThat(illegalArgumentException).isNotNull();
    }

    @Test
    void correctRolesByOrgNames(){
        var original = new ProductAreaMemberAccumulator.Original(List.of(), List.of());
        var updated = new ProductAreaMemberAccumulator.Updated(List.of(), List.of());
        var membersToPersist = ProductAreaMemberAccumulator.accumulate(original, updated, FULL_ORGANIZATIONAL).membersToPersist();

        var targets = List.of(
                PaMember.builder().navIdent(LEDER_NAV_IDENT).role(Role.LEADER).build(),
                PaMember.builder().navIdent("a910001").role(Role.DISCIPLINE_DIRECTOR).build(),
                PaMember.builder().navIdent("a910002").role(Role.PERSONELLROSTER_RESPONSIBLE).build(),
                PaMember.builder().navIdent("a910003").role(Role.DISCIPLINE_AND_DELIVERY_MANAGER).build()
        );

        Assertions.assertThat(membersToPersist).containsAll(targets);

    }


}