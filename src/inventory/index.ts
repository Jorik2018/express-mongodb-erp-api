import 'dotenv-flow/config';
import express, { Request, Router, Response, NextFunction } from 'express';
import createMemoryStore from 'memorystore';
import passport from 'passport';
import storageMiddleware from './storageMiddleware';
import authRouter from './authRouter';
import apiRouter from './apiRouter';

let session = require("express-session");

let { Strategy } = require("passport-github2");

const app = express();
const MemoryStore = createMemoryStore(session);

passport.use(new Strategy({
    clientID: process.env.GITHUB_KEY,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "/api/login",
    passReqToCallback: true,
}, (req: any, accessToken: any, refreshToken: any, profile: any, cb: any) => {
    req.session.token = accessToken;
    return cb(null, profile);
}));


passport.serializeUser((user:any, cb:any) => {
    cb(null, user);
});

passport.deserializeUser((obj: any, cb:any) => {
    cb(null, obj);
});

app.use((req: Request, res: any, next:NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('dist'));

const sess: any = {
    name: 'pia.sid',
    secret: process.env.SESSION_SECRET,
    resave: true,
    rolling: true,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000,
    }),
    cookie: {
        path: '/',
        sameSite: 'strict',
        // maxAge: 86400000,
    }
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}

app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());

app.use(storageMiddleware);

app.use('/api', authRouter);
app.use('/api', apiRouter);

app.listen(process.env.PORT || 5000, () => {
    console.info(`Listening on port ${process.env.PORT || 5000}! 👾`);
});
