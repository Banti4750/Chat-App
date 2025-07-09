import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ampq from 'amqplib';
dotenv.config();

export const startSendConsumer = async () => {
  try {
    const connection = await ampq.connect({
      protocol: 'amqp',
      hostname: process.env.Rabbimq_Host,
      port: 5672,
      username: process.env.Rabbitmq_USER,
      password: process.env.Rabbitmq_PASSWORD,
    });

    const channel = await connection.createChannel();
    const queueName = "send-otp";

    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log("✅ Mail service consumer started, listening for OTP emails...");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to,  subject , body } = JSON.parse(msg.content.toString());

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          const mailOptions = {
            from: `"Chat App" <${process.env.USER}>`,
            to,
            subject,
            text: body
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ OTP sent to ${to}`);

          channel.ack(msg);
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError);
          channel.nack(msg); // discard message (you can choose to requeue if needed)
        }
      }
    });
  } catch (err) {
    console.error("❌ Error initializing mail consumer:", err);
  }
};
