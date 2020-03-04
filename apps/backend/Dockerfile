FROM navikt/java:11

COPY target/app-exec.jar /app/app.jar

ENV JAVA_OPTS="-Xmx512m \
               -Djava.security.egd=file:/dev/./urandom"
