package no.nav.data.team.common.web;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.nais.NaisEndpoints;
import no.nav.data.team.common.validator.RequestElement;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.stream.Stream;

@Slf4j
@Aspect
@Component
public class RequestPointcut {

    @Before("execution(* no.nav.data.team..*Controller.*(..))")
    public void beforeController(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        if (signature.getMethod().getDeclaringClass().equals(NaisEndpoints.class)) {
            return;
        }
        log.debug("{} {}", signature.getDeclaringType().getSimpleName(), signature.getName());

        boolean isPut = signature.getMethod().isAnnotationPresent(PutMapping.class);
        Stream.of(joinPoint.getArgs())
                .filter(arg -> arg instanceof RequestElement)
                .map(arg -> (RequestElement) arg)
                .findFirst()
                .ifPresent(req -> {
                    log.trace("setting update to true");
                    req.setUpdate(isPut);
                });
    }

}
