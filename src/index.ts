import express, { Application, Request, Response } from 'express';
//import "express-async-errors";
import {json} from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import itemRoutes from './routes/itemRoutes';
import posts from "./routes/posts";
import csrf from 'csurf';
//import { readdirSync } from 'fs';
import { Server } from 'socket.io';

require('dotenv').config();

const app: Application = express();

const PORT = process.env.PORT || 3000;

import authRoute from './routes/auth'
import { createServer } from 'http';
import { IRoom } from './database/models/room';
import { knexMiddleware } from './database/objection_db';

app.use(express.json());
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

app.use(knexMiddleware);

app.use(
  multer({ storage: fileStorage, fileFilter }).single('image')
);


app.use(require("cors")());
/*app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});*/

app.use('/auth', authRoute);
const usersRoute = require('./routes/user');
const employeeRoute = require('./routes/employee');
app.use('/api/users', usersRoute.default)
app.use('/api/items', itemRoutes);
app.use('/api/employees', employeeRoute.default);
app.use('/api/offices', require('./routes/office').default);
app.use('/api/tasks', require('./routes/task').default);
app.use('/api/persons', require('./routes/person').default);
app.use("/api/posts", posts);
/*
readdirSync('./routes').map((route) => {
  console.log(route);
  //app.use('/api', require(`./routes/${route}`));
});
*/
app.use((err: any, _req: Request, res: Response, _next: ()=>void) => {
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data || null;
  console.error(err.stack)
  res.status(status).json({ message, data });
  //res.status(status).send('Something broke!')
})

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(require('morgan')('dev'));

app.use(csrf({ cookie: true }));

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

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
      console.log('A user connected');
      socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
      });
      socket.on('login', (msg) => {
        console.log('login: ' + JSON.stringify(msg));
        require('./controllers/room').list({}, {
          send: ({ data, ...others }: Error & { data: IRoom[] }) => {
            socket.emit('login', { rooms: data, ...others });
          }
        })
        socket.emit('login', { message: "Success", rooms: [] })
      });
      socket.on('createroom', (room: IRoom) => {
        require('./controllers/room').create({ body: room }, {
          send: (res: { error: Error } | IRoom) => {
            socket.emit('createroom', res);
          }
        })
      });
      socket.on('fetchroom', (id: string) => {
        require('./controllers/room').find({ params: { id } }, {
          send: (res: { error: Error } | IRoom) => {
            socket.emit('fetchroom', res);
          }
        })
      });
      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });

    io.listen(server);
    // app.start = app.listen = function(){
    //   return server.listen.apply(server, arguments)
    // }
    //app.listen(PORT, () => {
    server.listen(PORT, () => {
      console.log(`*** SERVER IS RUNNING ON PORT ${PORT} ***`);
    });
  })
  .catch((error) => {
    console.log(`*** DB CONNECTION ERROR ❌ => `, error);
  });
