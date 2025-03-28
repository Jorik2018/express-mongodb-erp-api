const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
import { model } from "mongoose";

const User = model('User');

passport.use(
    new localStrategy({
        usernameField: 'emailId'
    },
        (username: string, password: string, done:any) => {
            User.findOne({
                email: username
            },
                (err:any, user:any) => {
                    if (err)
                        return done(err);
                    else if (!user)
                        return done(null, false, { message: 'Email is not registered' });
                    else if (!user.verifyPassword(password))
                        return done(null, false, { message: 'Wrong Password' });
                    else
                        return done(null, user);
                });
        }
    )
);
