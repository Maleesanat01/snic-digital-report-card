import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Establishing the MongoDB connection
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Event listeners for mongoose connection
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Gracefully handling shutdown signals
    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing MongoDB connection...');
      await mongoose.connection.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing MongoDB connection...');
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

export default connectDB;
