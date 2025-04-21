import { Router, static as _static } from 'express';
import connectDB from './config/db';
const path = require('path');

const router = Router();

connectDB();

router.use('/users', require('./routes/api/users'));
router.use('/auth', require('./routes/api/auth'));
router.use('/profile', require('./routes/api/profile'));
router.use('/posts', require('./routes/api/posts'));

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  router.use(_static('client/build'));

  router.get('*', (req: any, res: any) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
