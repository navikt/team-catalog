import session from 'express-session';
import { v4 as uuidv4 } from 'uuid'

const SESSION_MAX_AGE_MILLISECONDS = 60 * 60 * 1000;

const setup = (app) => {
    app.set('trust proxy', 1);
    const options = {
        cookie: {
            maxAge: SESSION_MAX_AGE_MILLISECONDS,
            //sameSite: 'lax',
            httpOnly: process.env.NODE_ENV !== 'development',
        },
        secret: uuidv4(),
        name: 'teamcatalog',
        resave: false,
        saveUninitialized: true,
        unset: 'destroy',
    }

    app.use(session(options));
};


export default { setup };