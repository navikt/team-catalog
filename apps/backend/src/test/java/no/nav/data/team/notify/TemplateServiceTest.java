package no.nav.data.team.notify;

import no.nav.data.common.template.FreemarkerConfig;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.dto.MailModels.Resource;
import no.nav.data.team.notify.dto.MailModels.TypedItem;
import no.nav.data.team.notify.dto.MailModels.UpdateItem;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import no.nav.data.team.notify.dto.MailModels.UpdateModel.TargetType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TemplateServiceTest {

    private final TemplateService service = new TemplateService(new FreemarkerConfig().freemarkerService());

    @Test
    void teamUpdate() {
        UpdateModel model = new UpdateModel();
        model.setTime(NotificationTime.ALL);
        model.setBaseUrl("http://baseurl");

        model.getCreated().add(new TypedItem(TargetType.AREA, "1", model.getBaseUrl() + "/area/1", "Basisområdet"));
        model.getDeleted().add(new TypedItem(TargetType.TEAM, "1", model.getBaseUrl() + "/team/1", "Le team"));
        model.getUpdated().add(
                UpdateItem.builder()
                        .item(new TypedItem(TargetType.TEAM, "2", model.getBaseUrl() + "/team/2", "Le teamo 2"))
                        .fromName("Le teamo origo")
                        .toName("Le teamo 2")
                        .fromOwnershipType("Prosjektteam")
                        .toOwnershipType("It-team")
                        .oldProductArea(pa("Basisområdet", model.getBaseUrl() + "/area/1"))
                        .newProductArea(pa("Sekundærområdet", model.getBaseUrl() + "/area/2"))
                        .removedMembers(List.of(new Resource(model.getBaseUrl() + "/resource/1", "Petter", "S123456")))
                        .newMembers(List.of(new Resource(model.getBaseUrl() + "/resource/2", "Morten", "S123457")))
                        .build()
        );
        model.getUpdated().add(
                UpdateItem.builder()
                        .item(new TypedItem(TargetType.AREA, "2", model.getBaseUrl() + "/area/2", "Sekundærområdet"))
                        .fromName("")
                        .toName("")
                        .fromOwnershipType("Produktområde")
                        .toOwnershipType("Annet")
//                        .removedMembers(List.of(new Resource(model.getBaseUrl() + "/resource/1", "Petter", "S123456")))
//                        .newMembers(List.of(new Resource(model.getBaseUrl() + "/resource/2", "Morten", "S123457")))
                        .removedTeams(List.of(new TypedItem(TargetType.TEAM, "1", model.getBaseUrl() + "/team/1", "Le teamo")))
                        .newTeams(List.of(new TypedItem(TargetType.TEAM, "2", model.getBaseUrl() + "/team/2", "Le teamo 2")))
                        .build()
        );

        var html = service.teamUpdate(model);
        assertThat(html).isNotNull();
        System.out.println(html);
    }

    private TypedItem pa(String name, String url) {
        return new TypedItem(TargetType.AREA, null, name, url);
    }

}