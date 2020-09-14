package no.nav.data.common.template;


import freemarker.template.Configuration;
import freemarker.template.TemplateExceptionHandler;
import lombok.SneakyThrows;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

import java.io.StringWriter;

@org.springframework.context.annotation.Configuration
public class FreemarkerConfig {

    @Bean
    public FreemarkerService freemarkerService() {
        return new FreemarkerService();
    }

    @SneakyThrows
    private Configuration freemarkerConfig() {
        var config = new Configuration(Configuration.VERSION_2_3_30);
        config.setDirectoryForTemplateLoading(new ClassPathResource("/template/freemarker").getFile());
        config.setWrapUncheckedExceptions(true);
        dev(config);
        return config;
    }

    private void dev(Configuration config) {
        config.setTemplateExceptionHandler(TemplateExceptionHandler.HTML_DEBUG_HANDLER);
        config.setLogTemplateExceptions(false);
    }

    public class FreemarkerService {

        private final Configuration cfg;

        public FreemarkerService() {
            cfg = freemarkerConfig();
        }

        @SneakyThrows
        public String generate(String templateName, Object model) {
            var template = cfg.getTemplate(templateName);
            try (var writer = new StringWriter()) {
                template.process(model, writer);
                return writer.toString();
            }
        }
    }
}
