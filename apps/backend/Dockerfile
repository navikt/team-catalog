FROM ghcr.io/navikt/baseimages/temurin:17
LABEL maintainer="Team Org"

ENV JAVA_OPTS="${JAVA_OPTS} -Xmx850m"
COPY target/app.jar app.jar
