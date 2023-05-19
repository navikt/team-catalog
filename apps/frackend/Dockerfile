FROM node:20-slim as builder

COPY . /app
WORKDIR /app

RUN npm clean-install
RUN ls -la
RUN npm run build


FROM gcr.io/distroless/nodejs18-debian11:nonroot
COPY --from=builder /app /app

WORKDIR /app
EXPOSE 8080
CMD ["dist/index.js"]
