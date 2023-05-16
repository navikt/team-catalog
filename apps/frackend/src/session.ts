import { Express } from "express";
import session, { SessionOptions } from "express-session";
import { v4 as uuidv4 } from "uuid";

import config from "./config.js";

declare module "express-session" {
  interface SessionData {
    [sessionId: string]: {
      expiresAt: number;
      accessToken: string;
      refreshToken: string;
    };
  }
}

// A valid session last 10 hours
const SESSION_MAX_AGE_MILLISECONDS = 10 * 60 * 60 * 1000;

export const setupSession = (app: Express) => {
  app.set("trust proxy", 1);
  const options: SessionOptions = {
    cookie: {
      maxAge: SESSION_MAX_AGE_MILLISECONDS,
      sameSite: "lax",
      httpOnly: true,
      secure: config.app.nodeEnv === "production",
    },
    secret: uuidv4(),
    name: "nom-ui-session",
    resave: false,
    saveUninitialized: true,
    unset: "destroy",
  };

  app.use(session(options));
};
