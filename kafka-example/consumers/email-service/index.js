require('dotenv').config();
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const kafka = new Kafka({
    clientId: 'email-service',
    brokers: process.env.KAFKA_BROKERS.split(',')
});

const consumer = kafka.consumer({ groupId: 'email-service-group' });

async function connectConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'email-notifications' });
        
        console.log('Email service connected to Kafka');
        
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const messageData = JSON.parse(message.value.toString());
                    console.log('Received email notification:', messageData);
                    
                    await sendWelcomeEmail(messageData.data);
                    console.log('Welcome email sent successfully');
                } catch (error) {
                    console.error('Error processing email:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

async function sendWelcomeEmail(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Welcome email sent to ${userData.email}`);
}

connectConsumer();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Email service running on port ${PORT}`);
}); 