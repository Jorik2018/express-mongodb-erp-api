import express, { Application, json, Request, Response } from 'express';
//import "express-async-errors";
//import { readdirSync } from 'fs';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import posts from "./routes/posts";
import csrf from 'csurf';
import { Server } from 'socket.io';

require('dotenv').config();

const app: Application = express();

const PORT = process.env.PORT || 3000;

import { createServer } from 'http';
import { knexMiddleware } from './database/objection_db';
import { configureSocket } from './quiz/server';

app.use(json());
app.use(express.urlencoded({ extended: true }));
//app.use(json());

const multer = require('multer');

app.use('/public', express.static(require('path').join(__dirname, 'assets')));

const fileStorage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    cb(null, 'assets/images');
  },
  filename: (req: Request, { originalname }: { originalname: string }, cb: any) => {
    cb(null, new Date().toISOString() + '-' + originalname);
  }
});

const fileFilter = (req: Request, file: { mimetype: string }, cb: Function) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//app.use(knexMiddleware);

app.use(
  multer({ storage: fileStorage, fileFilter }).single('image')
);

app.use(cookieParser());
app.use(require("cors")());
/*app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});*/
const api = process.env.API || '/api';
import authRoute from './routes/auth'
const isAuth = require('./auth/is-auth');
app.use(`${api}/oauth`, require('./routes/oauth').default);
app.use(api, authRoute(isAuth));
app.use(isAuth);
app.use(`${api}/users`, require('./routes/user').default);
app.use(`${api}/applications`, require('./routes/application').default);
app.use(`${api}/campaigns`, require('./controllers/campaign').default);
app.use(`${api}/contacts`, require('./routes/contact').default);
import itemRoutes from './routes/itemRoutes';
import path from 'path';
import { sendError } from './utils/errors';
app.use(`${api}/items`, itemRoutes);
app.use(`${api}/employees`, require('./routes/employee').default);
app.use(`${api}/offices`, require('./routes/office').default);
app.use(`${api}/tasks`, require('./routes/task').default);
app.use(`${api}/brands`, require('./routes/brand').default);
app.use(`${api}/persons`, require('./routes/person').default);
app.use(`${api}/posts`, posts);
/*
readdirSync('./routes').map((route) => {
  console.log(route);
  //app.use('/api', require(`./routes/${route}`));
});
*/
app.use((err: any, _req: Request, res: Response) => {
  sendError(res)(err)
})

app.use(require('morgan')('dev'));

//app.use(csrf({ cookie: true }));

app.get('/api/csrf-token', (req: any, res: any) => {
  res.json({ csrfToken: req.csrfToken() });
});
const { FRONTEND } = process.env;
if (FRONTEND) {
  app.use(express.static(path.join(__dirname, `${FRONTEND}/dist`)));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, `${FRONTEND}/dist/index.html`));
  });
}
// Connect to MongoDB
mongoose.connect(process.env.DB_URI!, {})
  .then(() => {
    console.log('*** DB CONNECTED ✔️ ***');
    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
      },
    });
    io.on('connection', (socket) => {
      configureSocket(socket)
    });
    io.listen(server);
    server.listen(PORT, () => {
      console.log(`*** SERVER IS RUNNING ON PORT ${PORT} ***`);
    });
  }).catch((error) => {
    console.log(`*** DB CONNECTION ERROR ❌ => `, error);
  });
