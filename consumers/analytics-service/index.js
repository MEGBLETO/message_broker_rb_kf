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
        
        await channel.assertQueue('analytics', {
            durable: true
        });
        
        // Set prefetch to 1 to ensure fair dispatch
        await channel.prefetch(1);
        
        console.log('Analytics service connected to RabbitMQ');
        
        // Start consuming messages
        channel.consume('analytics', async (data) => {
            try {
                const message = JSON.parse(data.content);
                console.log('Received analytics event:', message);
                
                // Simulate updating analytics
                await updateAnalytics(message.data);
                
                // Acknowledge the message after successful processing
                channel.ack(data);
                console.log('Analytics updated successfully');
            } catch (error) {
                console.error('Error processing analytics:', error);
                // Reject the message and requeue it
                channel.nack(data, false, true);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

async function updateAnalytics(eventData) {
    // Simulate analytics processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Analytics updated for user registration: ${eventData.userId}`);
}

connectQueue();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Analytics service running on port ${PORT}`);
}); 