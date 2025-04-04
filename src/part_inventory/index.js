import 'dotenv-flow/config';
import express from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy } from 'passport-github2';
import storageMiddleware from './storageMiddleware';
import authRouter from './authRouter';
import apiRouter from './apiRouter';

const app = express();
const MemoryStore = createMemoryStore(session);

passport.use(new Strategy({
    clientID: process.env.GITHUB_KEY,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "/api/login",
    passReqToCallback: true,
},(req, accessToken, refreshToken, profile, cb) => {
    req.session.token = accessToken;
    return cb(null, profile);
}));


passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('dist'));

const sess = {
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

app.use((req, res, next) => {
    next();
});

app.use('/api', authRouter);
app.use('/api', apiRouter);

app.listen(process.env.PORT || 5000, () => {
    console.info(`Listening on port ${process.env.PORT || 5000}! 👾`);
});
