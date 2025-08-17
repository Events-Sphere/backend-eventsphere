# Events-Sphere Backend API

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

The backend API for **Events-Sphere**, a smart event management and booking platform designed for concerts, conferences, sports, and more. It features real-time availability, dynamic pricing, and role-based access for admins, organizers, and users.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Folder Structure](#folder-structure)
* [Environment Variables](#environment-variables)
* [API Endpoints](#api-endpoints)

  * [Authentication](#authentication)
  * [Users](#users)
  * [Events](#events)
* [License](#license)

---

## Features

* **User Authentication**: Secure login and registration with JWT tokens.
* **Role-Based Access Control**: Separate dashboards for admins, organizers, and users.
* **Event Management**: CRUD operations for events with real-time availability and dynamic pricing.
* **Secure Payment Integration**: Facilitates secure transactions for event bookings.
* **Load Balancing**: LRU cache mechanism.
* **Multi-Language Support**: Offers a user-friendly checkout process with support for multiple languages.

---

## Tech Stack

* **Language**: TypeScript
* **Framework**: Express.js
* **Database**: MySQL
* **Authentication**: JWT
* **Other Tools**: dotenv, bcrypt, cors, nodemon (for development)

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Events-Sphere/backend-eventsphere.git
cd backend-eventsphere
```

### Install Dependencies

```bash
npm install
```

### Run the Server

```bash
npm run dev
```

Visit the server at:

```
http://localhost:3000/
```

---

## Folder Structure

```
backend-eventsphere/
├── src/
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── cache/             # LRU cache for fast lookup
├── .gitignore             # Git ignore rules
├── package.json           # Project metadata and dependencies
├── package-lock.json      # Exact version of dependencies
└── tsconfig.json          # TypeScript configuration
```

---

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=3000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

---

## API Endpoints

### Authentication

| Method | Endpoint         | Description         | Body Example                                                            |
| ------ | ---------------- | ------------------- | ----------------------------------------------------------------------- |
| POST   | `/auth/register` | Register a new user | `{ "name": "John", "email": "john@example.com", "password": "123456" }` |
| POST   | `/auth/login`    | Login a user        | `{ "email": "john@example.com", "password": "123456" }`                 |

---

### Users

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | `/users`     | Get all users       |
| GET    | `/users/:id` | Get user by ID      |
| PUT    | `/users/:id` | Update user details |
| DELETE | `/users/:id` | Delete a user       |

---

### Events

| Method | Endpoint      | Description        | Body Example                                                            |
| ------ | ------------- | ------------------ | ----------------------------------------------------------------------- |
| GET    | `/events`     | Get all events     | N/A                                                                     |
| POST   | `/events`     | Create a new event | `{ "title": "Music Fest", "date": "2025-09-01", "location": "Mumbai" }` |
| GET    | `/events/:id` | Get event by ID    | [List of events]A                                                                     |
| PUT    | `/events/:id` | Update event       | `{ "title": "Updated Title" }`                                          |
| DELETE | `/events/:id` | Delete event       | `{ "message": " deleted successfully" }  `                                                                   |

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
