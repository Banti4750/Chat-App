import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
dotenv.config();
const app = express();
const port = process.env.PORT;
import chatRoutes from './routes/chat.js' 

connectDB()
app.use(express.json());

//route
app.use('/api/v1' , chatRoutes)

app.listen(port , ()=>{
    console.log(`server is running on ${port}`)
})