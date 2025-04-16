import { getToken, validateToken } from "@navikt/oasis";
import { NextFunction, Request, Response } from "express";

export const verifyToken = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const token = getToken(request);
  if (!token) {
    response.status(401).send();
    return;
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    response.status(403).send();
    return;
  }

  return next();
};
