import { Request, Router, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../../../database/models/user';
import { sendError } from '../../../utils/errors';

const router = Router();
const gravatar = require('gravatar');

const jwt = require('jsonwebtoken');

const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    User.findOne({ email }).lean().exec().then(user => {
      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
      bcrypt.genSalt(10).then(salt => bcrypt.hash(password, salt).then(password => new User({
        name,
        email,
        avatar: normalize(
          gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
          }),
          { forceHttps: true }
        ),
        password
      }).save().then(({ id }) => {
        jwt.sign(
          {
            user: {
              id
            }
          },
          config.get('jwtSecret'),
          { expiresIn: '5 days' },
          (err: any, token: string) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      })
      ));
    }).catch(sendError(res));
  }
);

export default router;
