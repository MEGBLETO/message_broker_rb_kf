# Event-Driven Architecture Examples

This repository contains two examples of event-driven architecture implementations using different message brokers:
1. RabbitMQ
2. Apache Kafka

Both examples demonstrate a user registration flow where multiple services process different aspects of the registration event asynchronously.

## Project Structure

```
.
├── rabbitmq-example/
│   ├── docker-compose.yml
│   ├── producer/
│   └── consumers/
│       ├── email-service/
│       ├── admin-service/
│       └── analytics-service/
└── kafka-example/
    ├── docker-compose.yml
    ├── producer/
    └── consumers/
        ├── email-service/
        ├── admin-service/
        └── analytics-service/
```

## Services

### Producer Service
- Handles user registration
- Publishes events to different queues/topics
- Runs on port 3000

### Consumer Services
1. **Email Service**
   - Sends welcome emails to new users
   - Runs on port 3001

2. **Admin Service**
   - Sends notifications to administrators
   - Runs on port 3002

3. **Analytics Service**
   - Updates analytics for user registrations
   - Runs on port 3003

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### RabbitMQ Example

1. Start RabbitMQ:
```bash
cd rabbitmq-example
docker-compose up -d
```

2. Start the producer service:
```bash
cd producer
npm install
npm run dev
```

3. Start the consumer services (in separate terminals):
```bash
# Email Service
cd consumers/email-service
npm install
npm run dev

# Admin Service
cd consumers/admin-service
npm install
npm run dev

# Analytics Service
cd consumers/analytics-service
npm install
npm run dev
```

### Kafka Example

1. Start Kafka and Zookeeper:
```bash
cd kafka-example
docker-compose up -d
```

2. Start the producer service:
```bash
cd producer
npm install
npm run dev
```

3. Start the consumer services (in separate terminals):
```bash
# Email Service
cd consumers/email-service
npm install
npm run dev

# Admin Service
cd consumers/admin-service
npm install
npm run dev

# Analytics Service
cd consumers/analytics-service
npm install
npm run dev
```

## Testing the System

Send a user registration request:

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

## Monitoring

### RabbitMQ
- Management UI: http://localhost:15672
- Default credentials: guest/guest



## Environment Variables

Each service requires a `.env` file with the following variables:

### RabbitMQ Services
```
RABBITMQ_URL=amqp://localhost:5672
PORT=<service_port>
```

### Kafka Services
```
KAFKA_BROKERS=localhost:9092
PORT=<service_port>
```
