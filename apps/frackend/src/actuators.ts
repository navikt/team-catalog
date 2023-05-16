import { Express } from "express";

export function setupActuators(app: Express) {
  app.get("/internal/health/liveness", (request, response) => {
    response.send({
      status: "UP",
    });
  });
  console.log("Liveness available on /internal/health/liveness");

  app.get("/internal/health/readiness", (request, response) => {
    response.send({
      status: "UP",
    });
  });
  console.log("Readiness available on /internal/health/readiness");
}
