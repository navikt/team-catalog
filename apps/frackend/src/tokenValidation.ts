import { getToken, validateToken } from "@navikt/oasis";
import { NextFunction, Request, Response } from "express";

export const verifyToken = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const token = getToken(request);
  if (!token) {
    return response.status(401).send();
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    return response.status(403).send();
  }

  return next();
};
