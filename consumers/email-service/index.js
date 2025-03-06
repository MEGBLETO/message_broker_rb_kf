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
        
        // Set prefetch to 1 to ensure fair dispatch
        await channel.prefetch(1);
        
        console.log('Email service connected to RabbitMQ');
        
        // Start consuming messages
        channel.consume('email_notifications', async (data) => {
            try {
                const message = JSON.parse(data.content);
                console.log('Received email notification:', message);
                
                // Simulate sending welcome email
                await sendWelcomeEmail(message.data);
                
                // Acknowledge the message after successful processing
                channel.ack(data);
                console.log('Welcome email sent successfully');
            } catch (error) {
                console.error('Error processing email:', error);
                // Reject the message and requeue it
                channel.nack(data, false, true);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

async function sendWelcomeEmail(userData) {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Welcome email sent to ${userData.email}`);
}

connectQueue();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Email service running on port ${PORT}`);
}); 