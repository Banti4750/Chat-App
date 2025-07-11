import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const MongoUri = process.env.MONGO_URI;

const connectDB = async () => {
    if (!MongoUri) {
        console.log("MongoUri is not defined");
        return;
    }

    try {
        await mongoose.connect(MongoUri,{
             dbName:"chatapp-2"
        });
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
    }
};

export default connectDB;
