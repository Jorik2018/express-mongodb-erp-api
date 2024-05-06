import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import itemRoutes from './routes/itemRoutes';
import csrf from 'csurf';
import { readdirSync } from 'fs';

require('dotenv').config();

const app: Application = express();

const PORT = process.env.PORT || 3000;

import authRoute from './routes/auth'

//app.use(express.json());
app.use(bodyParser.json());

app.use(require("cors")());
// Routes
app.use('/auth', authRoute);
const usersRoute = require('./routes/user');
const employeeRoute = require('./routes/employee');
app.use('/api/users', usersRoute.default)
app.use('/api/items', itemRoutes);
app.use('/api/employees', employeeRoute.default);
app.use('/api/offices', require('./routes/office').default);
/*
readdirSync('./routes').map((route) => {
  console.log(route);
	//app.use('/api', require(`./routes/${route}`));
});
*/
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(require('morgan')('dev'));

app.use(csrf({ cookie: true }));

app.get('/api/csrf-token', (req, res) => {
	res.json({ csrfToken: req.csrfToken() });
});

// Connect to MongoDB
mongoose.connect(process.env.DB_URI!, { })
  .then(() => {
    console.log('*** DB CONNECTED ✔️ ***');
    app.listen(PORT, () => {
      console.log(`*** SERVER IS RUNNING ON PORT ${PORT} ***`);
    });
  })
  .catch((error) => {
    console.log(`*** DB CONNECTION ERROR ❌ => `, error);
  });
