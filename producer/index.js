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
        
        // Create different queues for different types of events
        await channel.assertQueue('user_registration', {
            durable: true
        });
        
        await channel.assertQueue('email_notifications', {
            durable: true
        });
        
        await channel.assertQueue('admin_notifications', {
            durable: true
        });
        
        await channel.assertQueue('analytics', {
            durable: true
        });
        
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

connectQueue();

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
        await channel.sendToQueue(
            'user_registration',
            Buffer.from(JSON.stringify({
                type: 'USER_REGISTERED',
                data: user,
                timestamp: new Date()
            }))
        );

        // Publish welcome email event
        await channel.sendToQueue(
            'email_notifications',
            Buffer.from(JSON.stringify({
                type: 'WELCOME_EMAIL',
                data: {
                    email: user.email,
                    name: user.name
                },
                timestamp: new Date()
            }))
        );

        // Publish admin notification
        await channel.sendToQueue(
            'admin_notifications',
            Buffer.from(JSON.stringify({
                type: 'NEW_USER_REGISTERED',
                data: {
                    userId: user.id,
                    email: user.email,
                    name: user.name
                },
                timestamp: new Date()
            }))
        );

        // Publish analytics event
        await channel.sendToQueue(
            'analytics',
            Buffer.from(JSON.stringify({
                type: 'USER_REGISTRATION',
                data: {
                    userId: user.id,
                    timestamp: new Date()
                }
            }))
        );

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