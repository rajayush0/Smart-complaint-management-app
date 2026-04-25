import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const conn = await mongoose.connect(mongoUri, {
            // Options are no longer needed in Mongoose 6+ but keeping standard connection handling
        });
        console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
