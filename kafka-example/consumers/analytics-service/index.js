require('dotenv').config();
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const kafka = new Kafka({
    clientId: 'analytics-service',
    brokers: process.env.KAFKA_BROKERS.split(',')
});

const consumer = kafka.consumer({ groupId: 'analytics-service-group' });

async function connectConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'analytics' });
        
        console.log('Analytics service connected to Kafka');
        
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const messageData = JSON.parse(message.value.toString());
                    console.log('Received analytics event:', messageData);
                    
                    await updateAnalytics(messageData.data);
                    console.log('Analytics updated successfully');
                } catch (error) {
                    console.error('Error processing analytics:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

async function updateAnalytics(eventData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Analytics updated for user registration: ${eventData.userId}`);
}

connectConsumer();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Analytics service running on port ${PORT}`);
}); 