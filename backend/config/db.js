import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected');

        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } catch (error) {
        console.error('MongoDB connection failed', error);
        process.exit(1);
    }
};

export default connectDB;
