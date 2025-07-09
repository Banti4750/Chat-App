import mongoose from "mongoose";

const connectDB = async () =>{
    const url = process.env.MONGO_URI;

    if(!url){
        throw new Error("Mongo uri in not find in .env");
    }

    try {
        await mongoose.connect(url , {
            dbName:"chatapp-2"
        })
        console.log("✅ Connected to mongoDB")
    } catch (error) {
        console.log("failed to connect mongoDB")
        process.exit(1);
    }
}

export default connectDB;