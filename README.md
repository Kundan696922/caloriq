# Caloriq

Caloriq is a full-stack nutrition and wellness application that helps users track calories, monitor weight progress, plan meals, and interact with an AI-powered nutrition assistant. The project includes a Node.js/Express backend and a React + Vite frontend.

## Overview

Caloriq combines:

- User authentication and profile management
- Calorie and macro goal calculation
- Food search and meal tracking
- Weight tracking and progress insights
- AI chat support for nutrition guidance
- Dashboard summaries for health and eating habits

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- CORS, cookie parsing, validation middleware
- dotenv and Nodemon for local development

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS

## Project Structure

```text
caloriq/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── package-lock.json
└── README.md
```

## Features

- Secure registration and login
- Personal goal calculations for calories and nutrition
- Food data retrieval and management
- Meal logging and meal history
- Weight tracking and progress visualization
- Dashboard metrics and user summaries
- AI-powered chat / recommendation experience
- CORS-aware API configuration for local and deployed frontends

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- npm
- MongoDB running locally or a valid MongoDB connection string

## Environment Setup

### Backend
Create a `.env` file inside the `backend` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/caloriq
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_key
```

Notes:
- `MONGODB_URI` is required for database-backed features.
- `CLIENT_URL` allows the frontend origin in development.
- `JWT_SECRET` is used for authentication token signing.

## Running the Project

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Start the backend

```bash
npm run dev
```

The backend runs on:

- http://localhost:5000

### 3) Install frontend dependencies

```bash
cd frontend
npm install
```

### 4) Start the frontend

```bash
npm run dev
```

The frontend development server runs on:

- http://localhost:5173

## API Overview

The backend exposes routes such as:

- `/api/auth` – login and registration
- `/api/users` – user profile and account routes
- `/api/calculators` – calorie and goal calculations
- `/api/foods` – food lookup and nutrition data
- `/api/meals` – meal creation and retrieval
- `/api/weight` – weight tracking endpoints
- `/api/dashboard` – dashboard analytics
- `/api/chat` – AI assistant interactions
- `/api/health` – health check endpoint

## Production Notes

- The app is designed to keep running even if MongoDB is temporarily unavailable, but database-backed features will not work until the connection is restored.
- In production, set `NODE_ENV=production` and use a secure `JWT_SECRET`.
- Update `CLIENT_URL` to match the deployed frontend domain.

## Common Development Commands

### Backend
```bash
cd backend
npm install
npm run dev
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
npm run build
```

## License

This project is currently provided without a formal license. Add a license file if you want to define usage and distribution terms.

## Contributing

If you want to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Contact

For questions or collaboration, contact the project maintainer or update this section with your preferred contact details.
