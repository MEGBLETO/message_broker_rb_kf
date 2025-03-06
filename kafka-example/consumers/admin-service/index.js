require('dotenv').config();
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const kafka = new Kafka({
    clientId: 'admin-service',
    brokers: process.env.KAFKA_BROKERS.split(',')
});

const consumer = kafka.consumer({ groupId: 'admin-service-group' });

async function connectConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'admin-notifications' });
        
        console.log('Admin service connected to Kafka');
        
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const messageData = JSON.parse(message.value.toString());
                    console.log('Received admin notification:', messageData);
                    
                    await sendAdminNotification(messageData.data);
                    console.log('Admin notification sent successfully');
                } catch (error) {
                    console.error('Error processing admin notification:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

async function sendAdminNotification(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Admin notification sent for new user: ${userData.name} (${userData.email})`);
}

connectConsumer();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`);
}); 