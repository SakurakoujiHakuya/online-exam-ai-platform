FROM maven:3.9-eclipse-temurin-8 AS builder

WORKDIR /build
COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:8-jre

WORKDIR /app
COPY --from=builder /build/target/exam-system-1.0.0.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENV TZ=Asia/Shanghai

ENTRYPOINT ["java", "-Duser.timezone=Asia/Shanghai", "-jar", "app.jar"]
