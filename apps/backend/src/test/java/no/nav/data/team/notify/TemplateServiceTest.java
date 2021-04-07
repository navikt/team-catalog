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
        model.getUpdated().add(new UpdateItem(
                new TypedItem(TargetType.TEAM, "2", model.getBaseUrl() + "/team/2", "Le teamo 2"),
                "Le teamo origo", "Le teamo 2",
                "Posjektteam", "It-team",
                pa("Basisområdet", model.getBaseUrl() + "/area/1"), pa("Sekundærområdet", model.getBaseUrl() + "/area/2"),
                List.of(new Resource(model.getBaseUrl() + "/resource/1", "Petter", "S123456")),
                List.of(new Resource(model.getBaseUrl() + "/resource/2", "Morten", "S123457")),
                List.of(), List.of()
        ));
        model.getUpdated().add(new UpdateItem(
                new TypedItem(TargetType.AREA, "2", model.getBaseUrl() + "/area/2", "Sekundærområdet"),
                "", "",
                "Produktområde", "Annet",
                null, null,
                List.of(), List.of(),
                List.of(new TypedItem(TargetType.TEAM, "1", model.getBaseUrl() + "/team/1", "Le teamo")),
                List.of(new TypedItem(TargetType.TEAM, "2", model.getBaseUrl() + "/team/2", "Le teamo 2"))
        ));

        var html = service.teamUpdate(model);
        assertThat(html).isNotNull();
        System.out.println(html);
    }

    private TypedItem pa(String name, String url) {
        return new TypedItem(TargetType.AREA, null, name, url);
    }

}