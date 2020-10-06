package no.nav.data.team.notify;

import lombok.Getter;
import no.nav.data.common.template.FreemarkerConfig.FreemarkerService;
import no.nav.data.team.notify.dto.MailModels.NudgeModel;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import org.springframework.stereotype.Service;

@Service
public class TemplateService {

    private final FreemarkerService freemarkerService;

    public TemplateService(FreemarkerService freemarkerService) {
        this.freemarkerService = freemarkerService;
    }

    public String teamUpdate(UpdateModel model) {
        return freemarkerService.generate(model);
    }

    public String nudge(NudgeModel model) {
        return freemarkerService.generate(model);
    }

    public enum MailTemplates {
        TEAM_UPDATE("team-update.ftl"),
        TEAM_NUDGE("team-nudge.ftl");

        @Getter
        private final String templateName;

        MailTemplates(String template) {
            templateName = template;
        }

    }
}
