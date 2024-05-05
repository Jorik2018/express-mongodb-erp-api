import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import itemRoutes from './routes/itemRoutes';

const app: Application = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/mydatabase';

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/items', itemRoutes);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });
