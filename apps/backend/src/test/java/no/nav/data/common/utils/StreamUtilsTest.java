package no.nav.data.common.utils;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.function.Function;

import static no.nav.data.common.utils.StreamUtils.distinctByKey;
import static org.assertj.core.api.Assertions.assertThat;

class StreamUtilsTest {

    @Test
    void testDistinctByKey() {
        var list = List.of("a", "b", "c", "b", "A");
        var distinct = distinctByKey(list, Function.identity());

        assertThat(distinct).containsExactly("a", "b", "c", "A");
    }
}