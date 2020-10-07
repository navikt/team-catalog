package no.nav.data.team.notify;

import no.nav.data.common.template.FreemarkerConfig;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.dto.MailModels.Item;
import no.nav.data.team.notify.dto.MailModels.NudgeModel;
import no.nav.data.team.notify.dto.MailModels.TypedItem;
import no.nav.data.team.notify.dto.MailModels.UpdateItem;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
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

        model.getCreated().add(new TypedItem("Område", model.getBaseUrl() + "/area/1", "Basisområdet"));
        model.getDeleted().add(new TypedItem("Team", model.getBaseUrl() + "/team/1", "Le team"));
        model.getUpdated().add(new UpdateItem(
                new TypedItem("Team", model.getBaseUrl() + "/team/2", "Le teamo 2"),
                "Le teamo origo", "Le teamo 2",
                "Posjektteam", "It-team",
                "Basisområdet", model.getBaseUrl() + "/area/1", "Sekundærområdet", model.getBaseUrl() + "/area/2",
                List.of(new Item(model.getBaseUrl() + "/resource/1", "Petter", false, "S123456")),
                List.of(new Item(model.getBaseUrl() + "/resource/2", "Morten", false, "S123457")),
                List.of(), List.of()
        ));
        model.getUpdated().add(new UpdateItem(
                new TypedItem("Område", model.getBaseUrl() + "/area/2", "Sekundærområdet"),
                "", "",
                "Produktområde", "Annet",
                null, null, null, null,
                List.of(), List.of(),
                List.of(new Item(model.getBaseUrl() + "/team/1", "Le teamo", true)),
                List.of(new Item(model.getBaseUrl() + "/team/2", "Le teamo 2"))
        ));

        var html = service.teamUpdate(model);
        assertThat(html).isNotNull();
        System.out.println(html);
    }

    @Test
    void teamNudge() {
        NudgeModel model = NudgeModel.builder()
                .targetUrl("http://baseurl/team/1")
                .targetName("Datajegerne")
                .targetType("Team")

                .recipientRole("Team lead")
                .cutoffTime("3 måneder")
                .build();

        var html = service.nudge(model);
        assertThat(html).isNotNull();
        System.out.println(html);
    }
}