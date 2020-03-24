FROM navikt/java:11

COPY target/app-exec.jar /app/app.jar

ENV JAVA_OPTS="-Xmx850m \
               -Djava.security.egd=file:/dev/./urandom"
