const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../config/default');
const {validationResult} = require('express-validator/check');
const User = require("../database/models/user");
const bcrypt = require("bcrypt");

const User = require('../database/user');

const signUp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation  failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const {email, name, password} = req.body;

    bycrpt.hash(password, 12)
        .then(hashedPsw => {
            const user = new User({
                email,
                name,
                password: hashedPsw
            });

            return user.save();
        })
        .then(result => {
            res.status(201)
                .json({
                    message: 'User Created',
                    result: true
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

const logIn = (req, res, next) => {
    const {email, password} = req.body;

    let loadedUser;

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bycrpt.compare(password, loadedUser.password);
        })
        .then(isEqual => {
                if (!isEqual) {
                    const error = new Error('Wrong Password');
                    error.statusCode = 401;
                    throw error;
                }

                const token = jwt.sign(
                    {
                        email: loadedUser.email,
                        userId: loadedUser._id.toString()
                    },
                    key,
                    {
                        expiresIn: '1h'
                    }
                );

                res.status(200).json(
                    {
                        token,
                        userId: loadedUser._id.toString()
                    });
            }
        )
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

};

const register = (req, res) => {
    const today = new Date();
    const userData = {
      fullName: req.body.fullName,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      date: today
    };
  
    User.findOne({
      email: req.body.email
    })
      .then(user => {
        if (!user) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            userData.password = hash;
            User.create(userData)
              .then(user => {
                const payload = {
                  _id: user._id,
                  fullName: user.fullName,
                  userName: user.userName,
                  email: user.email
                };
                let token = jwt.sign(payload, process.env.JWT_SECRET, {
                  expiresIn: 1440
                });
                res.json({ token: token });
              })
              .catch(err => {
                res.send("error: " + err);
              });
          });
        } else {
          res.json({ error: "Index already exists" });
        }
      })
      .catch(err => {
        res.send("error: " + err);
      });
  };

module.exports = {
    register,
    logIn,
    signUp
};