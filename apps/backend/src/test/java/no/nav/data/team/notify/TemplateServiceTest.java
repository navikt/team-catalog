package no.nav.data.team.notify;

import no.nav.data.common.template.FreemarkerConfig;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
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
                "", "",
                "", "It-team",
                "", "", "", "",
                List.of(), List.of(), List.of(), List.of()
        ));

        var html = service.teamUpdate(model);
        assertThat(html).isNotNull();
        System.out.println(html);
    }
}