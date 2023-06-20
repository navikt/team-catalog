FROM ghcr.io/navikt/baseimages/temurin:20
LABEL maintainer="Team Org"

ENV JAVA_OPTS="${JAVA_OPTS} -Xmx1536m -Xms1024m"
COPY target/app.jar app.jar
