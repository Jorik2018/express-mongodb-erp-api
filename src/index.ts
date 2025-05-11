import express, { Application, json, Request, Response, urlencoded, static as _static } from 'express';
//import bodyParser from 'body-parser';
//import "express-async-errors";
//import { readdirSync } from 'fs';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import posts from "./routes/posts";
import csrf from 'csurf';
import { Server } from 'socket.io';

require('dotenv').config();

const app: Application = express();

import { createServer } from 'http';
import { knexMiddleware } from './database/objection_db';
import { configureSocket } from './quiz/server';

app.use(json());
app.use(urlencoded({ extended: true }));

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

const multer = require('multer');

app.use('/public', _static(require('path').join(__dirname, 'assets')));
//app.use(_static(require('path').join(__dirname, 'public')));

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

//app.use(
// multer({ storage: fileStorage, fileFilter }).single('image')
//);

app.use(cookieParser());
app.use(require("cors")({ origin: '*' }));
/*
app.all("/*", (req: Request, res: Response, next) => {
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});*/
const api = process.env.API || '';

app.get(`${api}/hola/:name?`, (req, res) => {
  const name = req.params.name || 'Mundo';
  res.send(`Hola ${name}`);
});

import authRoute from './routes/auth'
const isAuth = require('./auth/is-auth').default
app.use(`${api}/file`, require('./controllers/upload').default);

app.use(`${api}/oauth`, require('./routes/oauth').default(isAuth));
app.use(api, authRoute(isAuth));
app.use(isAuth);
app.use(`${api}/users`, require('./routes/user').default);
app.use(`${api}/media`, require('./routes/media').default);
app.use(`${api}/applications`, require('./routes/application').default);
app.use(`${api}/campaigns`, require('./controllers/campaign').default);
app.use(`${api}/contacts`, require('./controllers/contact').default);
import itemRoutes from './routes/itemRoutes';
import path from 'path';
import { sendError } from './utils/responses';
app.use(`${api}/items`, itemRoutes);
app.use(`${api}/employees`, require('./routes/employee').default);
app.use(`${api}/offices`, require('./routes/office').default);
app.use(`${api}/tasks`, require('./routes/task').default);
app.use(`${api}/brands`, require('./routes/brand').default);
app.use(`${api}/persons`, require('./routes/person').default);
app.use(`${api}/dashboard`, require('./controllers/dashboard').default);
app.use(`${api}/posts`, posts);
/*
readdirSync('./routes').map((route) => {
  console.log(route);
  //app.use('/api', require(`./routes/${route}`));
});
*/
app.use((err: any, _req: Request, res: Response) => {
  console.log('index=', err)
  sendError(res)(err)
})

//app.use(require('morgan')('tiny'));
app.use(require('morgan')('dev'));

//app.use(csrf({ cookie: true }));

app.get(`${api}/csrf-token`, (req: any, res: any) => {
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
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`*** SERVER IS RUNNING ON PORT ${PORT} ***`);
    });
    /*
        router.listen(config.port, config.host, (e: any) => {
          if (e) {
            throw new Error('Internal Server Error');
          }
          logger.info(`${config.name} running on ${config.host}:${config.port}`);
        });
        */
  }).catch((error) => {
    console.log(`*** DB CONNECTION ERROR ❌ => [${process.env.DB_URI}]`, error);

  });
