# Stage 1: Build JAR cu Maven Local Repository Cache Mount
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

# Utilizăm BuildKit Cache Mount pentru /root/.m2 (Viteză maximă, 0 re-descărcări!)
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests

# Stage 2: Runtime cu OpenJDK 21 & Tesseract OCR pentru PDF-uri scanate / rasterizate
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-ron
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
