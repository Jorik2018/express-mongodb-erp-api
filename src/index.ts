import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import itemRoutes from './routes/itemRoutes';

require('dotenv').config();

const app: Application = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 3000;

// Middleware
//app.use(express.json());
import authRoute from './routes/auth'
app.use(bodyParser.json());
app.use(cors());
// Routes
app.use('/auth', authRoute);
const usersRoute = require('./routes/user');
const employeeRoute = require('./routes/employee');
app.use('/api/users', usersRoute.default)
app.use('/api/items', itemRoutes);
app.use('/api/employees', employeeRoute.default);
app.use('/api/offices', require('./routes/office').default);

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Connect to MongoDB
mongoose.connect(process.env.DB_URI!, { })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });
