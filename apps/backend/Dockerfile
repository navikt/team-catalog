FROM navikt/java:14

COPY target/app-exec.jar /app/app.jar

ENV JAVA_OPTS="-Xmx850m \
               --enable-preview \
               -Djava.security.egd=file:/dev/./urandom"
