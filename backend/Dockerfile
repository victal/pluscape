FROM openjdk:11-jdk
MAINTAINER Guilherme Victal <guilhermevictal@gmail.com>

ENTRYPOINT ["java", "-jar", "/usr/share/pluscape.jar"]

# Add the service itself
ARG JAR_FILE
ADD target/${JAR_FILE} /usr/share/pluscape.jar
