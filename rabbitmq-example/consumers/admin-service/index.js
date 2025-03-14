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
        
        await channel.assertQueue('admin_notifications', {
            durable: true
        });
        
        await channel.prefetch(1);
        
        console.log('Admin service connected to RabbitMQ');
        
        channel.consume('admin_notifications', async (data) => {
            try {
                const message = JSON.parse(data.content);
                console.log('Received admin notification:', message);
                
                await sendAdminNotification(message.data);
                channel.ack(data);
                console.log('Admin notification sent successfully');
            } catch (error) {
                console.error('Error processing admin notification:', error);
                channel.nack(data, false, true);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

async function sendAdminNotification(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Admin notification sent for new user: ${userData.name} (${userData.email})`);
}

connectQueue();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`);
}); 