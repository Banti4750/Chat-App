import ampq from 'amqplib'
import dotenv from 'dotenv'
dotenv.config()
let channel:ampq.Channel;

export const connectRabbitMQ = async () =>{
    try {
        const connction = await ampq.connect({
            protocol:'amqp',
            hostname:process.env.Rabbimq_Host,
            port:5672,
            username:process.env.Rabbitmq_USER,
            password:process.env.Rabbitmq_PASSWORD
        })
        channel = await connction.createChannel();
        console.log("✅ Connected to Rabbitmq")
    } catch (error) {
        console.log(error)
    }
};

export const publishToQueue = async(queueName:string , message:any) =>{
    if(!channel){
        console.log("Rabbit channel is not initilized")
    }
    await channel.assertQueue(queueName , {durable:true});
    channel.sendToQueue(queueName , Buffer.from(JSON.stringify(message)) , 
        {persistent:true}
    )
} 