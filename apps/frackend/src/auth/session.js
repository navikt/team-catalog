import session from 'express-session';
import crypto from 'crypto';

const SESSION_MAX_AGE_MILLISECONDS = 60 * 60 * 1000;

const setup = (app) => {
    app.set('trust proxy', 1);
    const options = {
        cookie: {
            maxAge: SESSION_MAX_AGE_MILLISECONDS,
            //sameSite: 'lax',
            //httpOnly: true,
        },
        secret: crypto.randomUUID(),
        name: 'teamcatalog',
        resave: false,
        saveUninitialized: true,
        unset: 'destroy',
    }

    app.use(session(options));
};


export default { setup };