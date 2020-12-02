package no.nav.data.common.kafka;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;

public class LogbackKafkaFilter extends Filter<ILoggingEvent> {

    @Override
    public FilterReply decide(ILoggingEvent event) {
        if ("The configuration 'specific.avro.reader' was supplied but isn't a known config.".equals(event.getMessage()) ||
                "The configuration 'schema.registry.url' was supplied but isn't a known config.".equals(event.getMessage())) {
            return FilterReply.DENY;
        }
        return FilterReply.NEUTRAL;
    }
}
