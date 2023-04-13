FROM node:19-slim as builder

COPY . /app
WORKDIR /app

RUN npm clean-install --omit=dev && \
    ls -la


FROM gcr.io/distroless/nodejs18-debian11:nonroot
COPY --from=builder /app /app

WORKDIR /app
EXPOSE 8080
CMD ["src/index.js"]
