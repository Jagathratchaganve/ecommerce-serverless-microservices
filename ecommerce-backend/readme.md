# 🛒 Serverless E-Commerce Microservices

A serverless e-commerce backend built using **Node.js** and **AWS**, following **Microservices** and **Event-Driven Architecture** principles.

## 🚀 Tech Stack

- Node.js
- Express.js
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Amazon SNS
- Amazon SQS
- Nodemailer
- Axios

---

## 📦 Services

- Product Service
- Inventory Service
- Cart Service
- Order Service
- Payment Service

---

## ⚡ Event-Driven Consumers

- Inventory Consumer
- Email Consumer

---

## 🏗️ Architecture

```text
                Client
                   │
                   ▼
            API Gateway
                   │
     ┌─────┬─────┬─────┬─────┬─────┐
     ▼     ▼     ▼     ▼     ▼
 Product Inventory Cart Order Payment
                              │
                              ▼
                    Payment DynamoDB
                              │
                              ▼
                JR_PaymentSuccessTopic (SNS)
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
        JR_InventoryQueue         JR_EmailQueue
                 │                         │
                 ▼                         ▼
      Inventory Consumer         Email Consumer
                 │                         │
                 ▼                         ▼
      Inventory DynamoDB       Gmail (Nodemailer)
```

---

## 🔄 Event Flow

```text
Client
   │
   ▼
Order Service
   │
   ▼
Payment Service
   │
   ▼
Store Payment
   │
   ▼
Publish PAYMENT_SUCCESS Event (SNS)
   │
   ├───────────────┐
   ▼               ▼
Inventory Queue   Email Queue
   │               │
   ▼               ▼
Inventory        Email
Consumer        Consumer
```

---

## ✨ Features

- Serverless Architecture
- Microservices Architecture
- Event-Driven Architecture
- REST APIs
- AWS Lambda Integration
- API Gateway Integration
- DynamoDB Integration
- SNS Fan-Out Pattern
- SQS Queue Processing
- Automatic Inventory Update
- Automatic Email Notification
- CloudWatch Logging

---

## 📂 Project Structure

```text
ecommerce-backend/

├── product-service/
├── inventory-service/
├── cart-service/
├── order-service/
├── payment-service/
├── inventory-consumer/
└── email-consumer/
```

---

## 📌 Future Enhancements

- SMS Consumer
- JWT Authentication
- Role-Based Authorization
- User Service
- Payment Gateway Integration
- CI/CD Pipeline
- Docker
- Terraform / AWS SAM

---

## 📄 License

This project is intended for learning and demonstration purposes.