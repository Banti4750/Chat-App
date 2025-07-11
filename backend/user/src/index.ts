import  express  from "express";
import dotenv from 'dotenv';
import {createClient} from 'redis'
import connectDB from "./config/db.js";
import userRoutes from './routes/user.js'
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
const port = process.env.PORT;

dotenv.config();

//connect to db
connectDB()

//connect to Rabbitmq
connectRabbitMQ();

//connect to redis 
export const redisClient =  createClient({
    url:process.env.REDIS_URL,
});
redisClient.connect().then(()=>console.log("✅ Connected to redis ")).catch(console.error);

const app = express();
app.use(cors());
app.use(express.json())

//user routes
app.use('/api/v1' , userRoutes);


app.listen(port , () =>{
    console.log(`Server is running on port ${port}`)
})