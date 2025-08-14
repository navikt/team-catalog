import type { NextFunction, Request, Response } from "express";

export function errorHandling(
  error: Error,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  response.status(500).json({
    error: "Internal server error",
  });
  return;
}
