package no.nav.data.team.common.security;

import com.microsoft.graph.http.GraphServiceException;
import com.microsoft.graph.logger.ILogger;
import com.microsoft.graph.logger.LoggerLevel;
import lombok.extern.slf4j.Slf4j;

@Slf4j
class GraphLogger implements ILogger {

    @Override
    public void setLoggingLevel(LoggerLevel level) {

    }

    @Override
    public LoggerLevel getLoggingLevel() {
        return null;
    }

    @Override
    public void logDebug(String message) {
        log.debug(message);
    }

    @Override
    public void logError(String message, Throwable throwable) {
        if (throwable instanceof GraphServiceException && ((GraphServiceException) throwable).getResponseCode() == 404) {
            log.debug(message, throwable);
            return;
        }
        log.error(message, throwable);
    }
}
