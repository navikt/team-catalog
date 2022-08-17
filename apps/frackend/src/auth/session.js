import session from 'express-session';
import { v4 as uuidv4 } from 'uuid'

const SESSION_MAX_AGE_MILLISECONDS = 12 * 60 * 60 * 1000;

const setup = (app) => {
    app.set('trust proxy', 1);
    const options = {
        cookie: {
            maxAge: SESSION_MAX_AGE_MILLISECONDS,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env["NODE_ENV"] === "production"
        },
        secret: uuidv4(),
        name: 'teamcatalog_session',
        resave: false,
        saveUninitialized: true,
        unset: 'destroy',
    }

    app.use(session(options));
};


export default { setup };