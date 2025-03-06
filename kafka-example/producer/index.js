require('dotenv').config();
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const kafka = new Kafka({
    clientId: 'user-registration-producer',
    brokers: process.env.KAFKA_BROKERS.split(',')
});

const producer = kafka.producer();

async function connectProducer() {
    try {
        await producer.connect();
        console.log('Connected to Kafka');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

connectProducer();

// Simulated user registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        
        if (!email || !name || !password) {
            return res.status(400).json({ 
                error: 'Email, name, and password are required' 
            });
        }

        // Simulate user creation in database
        const user = {
            id: Date.now(), // Simulated user ID
            email,
            name,
            createdAt: new Date()
        };

        // Publish user registration event
        await producer.send({
            topic: 'user-registration',
            messages: [
                {
                    key: user.id.toString(),
                    value: JSON.stringify({
                        type: 'USER_REGISTERED',
                        data: user,
                        timestamp: new Date()
                    })
                }
            ]
        });

        // Publish welcome email event
        await producer.send({
            topic: 'email-notifications',
            messages: [
                {
                    key: user.id.toString(),
                    value: JSON.stringify({
                        type: 'WELCOME_EMAIL',
                        data: {
                            email: user.email,
                            name: user.name
                        },
                        timestamp: new Date()
                    })
                }
            ]
        });

        // Publish admin notification
        await producer.send({
            topic: 'admin-notifications',
            messages: [
                {
                    key: user.id.toString(),
                    value: JSON.stringify({
                        type: 'NEW_USER_REGISTERED',
                        data: {
                            userId: user.id,
                            email: user.email,
                            name: user.name
                        },
                        timestamp: new Date()
                    })
                }
            ]
        });

        // Publish analytics event
        await producer.send({
            topic: 'analytics',
            messages: [
                {
                    key: user.id.toString(),
                    value: JSON.stringify({
                        type: 'USER_REGISTRATION',
                        data: {
                            userId: user.id,
                            timestamp: new Date()
                        }
                    })
                }
            ]
        });

        res.json({ 
            success: true, 
            message: 'User registered successfully',
            userId: user.id
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ 
            error: 'Failed to register user' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Producer service running on port ${PORT}`);
}); 