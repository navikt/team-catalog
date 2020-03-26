package no.nav.data.team.common.kafka;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.kafka.listener.ContainerStoppingBatchErrorHandler;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class KafkaErrorHandler extends ContainerStoppingBatchErrorHandler {

    private final Executor executor;

    private AtomicInteger counter = new AtomicInteger(0);
    private AtomicLong lastError = new AtomicLong(0);

    private static final long LONG = Duration.ofHours(3).toMillis();
    private static final long SHORT = Duration.ofSeconds(20).toMillis();

    private static final int SLOW_ERROR_COUNT = 10;
    private static final long COUNTER_RESET_TIME = SHORT * SLOW_ERROR_COUNT * 2;

    public KafkaErrorHandler() {
        this.executor = new SimpleAsyncTaskExecutor();
    }

    @Override
    public void handle(Exception e, ConsumerRecords<?, ?> records, Consumer<?, ?> consumer, MessageListenerContainer container) {
        var record = records.iterator().hasNext() ? records.iterator().next() : null;
        Optional.ofNullable(record)
                .map(ConsumerRecord::topic)
                .ifPresent(topic -> scheduleRestart(e, records, consumer, container, topic));
    }

    @SuppressWarnings({"pmd:DoNotUseThreads", "fb-contrib:SEC_SIDE_EFFECT_CONSTRUCTOR"})
    private void scheduleRestart(Exception e, ConsumerRecords<?, ?> records, Consumer<?, ?> consumer, MessageListenerContainer container, String topic) {
        long now = System.currentTimeMillis();
        if (now - lastError.getAndSet(now) > COUNTER_RESET_TIME) {
            counter.set(0);
        }
        int numErrors = counter.incrementAndGet();
        long stopTime = numErrors > SLOW_ERROR_COUNT ? LONG : SHORT * numErrors;

        executor.execute(() -> {
            try {
                Thread.sleep(stopTime);
                log.warn("Starting kafka container topic={}", topic);
                container.start();
            } catch (Exception exception) {
                log.error("Error starting kafka container", exception);
            }
        });

        log.warn("Stopping kafka container topic={} for {}", topic, Duration.ofMillis(stopTime).toString());
        super.handle(e, records, consumer, container);
    }

}
