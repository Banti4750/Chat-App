import express from "express";
import dotenv from 'dotenv'
import { startSendConsumer } from "./consumer.js";
dotenv.config();
const port  = process.env.PORT;
const app = express();

startSendConsumer();
app.listen(process.env.PORT , ()=>{
    console.log(`✅ Server is running on port ${port}`)
})