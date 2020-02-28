FROM adoptopenjdk:11-jre-hotspot as builder
WORKDIR application
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=layertools -jar application.jar extract

FROM navikt/java:11

ENV MAIN_CLASS=org.springframework.boot.loader.JarLauncher
ENV JAVA_OPTS="-Xmx1024m \
               -Djava.security.egd=file:/dev/./urandom"
COPY run-java.sh /

COPY --from=builder application/dependencies/ ./
COPY --from=builder application/snapshot-dependencies/ ./
COPY --from=builder application/resources/ ./
COPY --from=builder application/application/ ./

