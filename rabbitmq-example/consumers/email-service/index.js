require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let channel;
let connection;

async function connectQueue() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        
        await channel.assertQueue('email_notifications', {
            durable: true
        });
        
        await channel.prefetch(1);
        
        console.log('Email service connected to RabbitMQ');
        
        channel.consume('email_notifications', async (data) => {
            try {
                const message = JSON.parse(data.content);
                console.log('Received email notification:', message);
                
                await sendWelcomeEmail(message.data);
                channel.ack(data);
                console.log('Welcome email sent successfully');
            } catch (error) {
                console.error('Error processing email:', error);
                channel.nack(data, false, true);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

async function sendWelcomeEmail(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Welcome email sent to ${userData.email}`);
}

connectQueue();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Email service running on port ${PORT}`);
}); 