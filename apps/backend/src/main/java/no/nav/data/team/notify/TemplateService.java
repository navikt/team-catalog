package no.nav.data.team.notify;

import no.nav.data.common.template.FreemarkerConfig.FreemarkerService;
import org.springframework.stereotype.Service;

import static no.nav.data.team.notify.TemplateService.MailTemplates.TEAM_UPDATE;

@Service
public class TemplateService {

    private final FreemarkerService freemarkerService;

    public TemplateService(FreemarkerService freemarkerService) {
        this.freemarkerService = freemarkerService;
    }

    public String teamUpdate(Object model) {
        return freemarkerService.generate(TEAM_UPDATE.templateName, model);
    }

    public String nudge(Object model) {
        // todo
        return freemarkerService.generate("nudge", model);
    }

    enum MailTemplates {
        TEAM_UPDATE("team-update.ftl");

        private final String templateName;

        MailTemplates(String template) {
            templateName = template;
        }

    }
}
