package no.nav.data.common.template;


import freemarker.template.Configuration;
import freemarker.template.TemplateExceptionHandler;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

import java.io.StringWriter;

@org.springframework.context.annotation.Configuration
public class FreemarkerConfig {

    @Bean
    public FreemarkerService freemarkerService() {
        return new FreemarkerService();
    }

    private Configuration freemarkerConfig() {
        try {
            var config = new Configuration(Configuration.VERSION_2_3_30);
            config.setDirectoryForTemplateLoading(new ClassPathResource("/template/freemarker").getFile());
            config.setWrapUncheckedExceptions(true);
            dev(config);
            return config;
        } catch (Exception e) {
            throw new TechnicalException("io error", e);
        }
    }

    private void dev(Configuration config) {
        config.setTemplateExceptionHandler(TemplateExceptionHandler.HTML_DEBUG_HANDLER);
        config.setLogTemplateExceptions(false);
    }

    @Slf4j
    public class FreemarkerService {

        private final Configuration cfg;

        public FreemarkerService() {
            cfg = freemarkerConfig();
        }

        public String generate(String templateName, Object model) {
            try (var writer = new StringWriter()) {
                var template = cfg.getTemplate(templateName);
                template.process(model, writer);
                return writer.toString();
            } catch (Exception e) {
                TechnicalException freemarkerError = new TechnicalException("io error", e);
                log.error(e.getMessage(), e);
                throw freemarkerError;
            }
        }
    }
}
