import mongoose from 'mongoose';
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {});
        console.log('Mongo DB is connected...');
    } catch (err) {
        process.exit(1);
    }
}

export default connectDB;