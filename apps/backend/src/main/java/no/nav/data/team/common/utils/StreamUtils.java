package no.nav.data.team.common.utils;

import no.nav.data.team.common.exceptions.NotFoundException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public final class StreamUtils {

    private StreamUtils() {
    }

    public static <T> Stream<T> safeStream(Iterable<T> iterable) {
        return iterable == null ? Stream.empty() : StreamSupport.stream(iterable.spliterator(), false);
    }

    public static <T> List<T> nullToEmptyList(List<T> list) {
        return list == null ? Collections.emptyList() : list;
    }

    public static <T> List<T> copyOf(List<T> list) {
        return list == null ? Collections.emptyList() : List.copyOf(list);
    }

    public static <T> List<T> union(List<T> listA, List<T> listB) {
        ArrayList<T> list = new ArrayList<>(listA);
        list.addAll(listB);
        return list;
    }

    public static <T, F> List<T> convert(Collection<F> from, Function<F, T> converter) {
        return safeStream(from).map(converter).filter(Objects::nonNull).collect(Collectors.toList());
    }

    @SafeVarargs
    public static <T, F> List<T> applyAll(Collection<F> from, Function<F, Collection<T>>... converters) {
        return Stream.of(converters)
                .map(f -> convert(from, f))
                .flatMap(Collection::stream)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
    }

    @SafeVarargs
    public static <T, F> List<T> applyAll(F from, Function<F, Collection<T>>... converters) {
        return Stream.of(converters)
                .map(f -> f.apply(from))
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
    }

    public static <T> List<T> filter(Iterable<T> objects, Predicate<T> filter) {
        return safeStream(objects).filter(filter).collect(Collectors.toList());
    }

    public static <T> T find(Iterable<T> objects, Predicate<T> filter) {
        return safeStream(objects).filter(filter).findFirst().orElseThrow(() -> new NotFoundException("could not find item"));
    }
}
