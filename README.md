# Caloriq – Full-Stack Nutrition & Wellness Web App

**Caloriq** is a **Full-Stack Nutrition & Wellness Web App** built with the **MERN stack** + Tailwind CSS. It helps users calculate calorie goals, track food and weight progress, plan meals, and interact with an AI-powered nutrition assistant.

---

## 🚀 Demo

> 🌐 Live Demo: 👉 [View Caloriq](https://caloriq-liart.vercel.app/)

---

## 🛠️ Tools Used

| Tool | Description |
|------|-------------|
| ![MongoDB](https://img.icons8.com/color/24/mongodb.png) **MongoDB** | NoSQL database for user profiles, meals, and weight data |
| ![Express](https://img.icons8.com/ios/24/express-js.png) **Express.js** | Backend API framework |
| ![React](https://img.icons8.com/color/24/react-native.png) **React** | Frontend UI library |
| ![Node.js](https://img.icons8.com/color/24/nodejs.png) **Node.js** | Server-side JavaScript runtime |
| ![TailwindCSS](https://img.icons8.com/color/24/tailwindcss.png) **TailwindCSS** | Responsive UI styling |
| <img src="https://cdn.simpleicons.org/googlegemini?viewbox=auto" width="20"> **Gemini API** | AI-powered meal recommendations and nutrition chat |
| <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtiNbpvzB-nh0v1S2d-KkChPo8gmem8u8bcci8AoBxh41PUCQe_t-h5xM&s=10" width="24"> **USDA API** | Food and nutrition data  |
| ![VSCode](https://img.icons8.com/color/24/visual-studio-code-2019.png) **VS Code** | Code editor |

---

## 🌟 Features

- 🔐 **Authentication** – Secure registration, login, and protected features
- 🧮 **Calorie Calculator** – Personalized calorie and macro goals
- 🍎 **Food Tracking** – Search and log foods using nutrition data
- 🤖 **AI Nutrition Assistant** – AI-powered nutrition chat
- 🍽️ **AI Meal Recommendations** – Generate personalized meal suggestions
- ⚖️ **Weight Tracking** – Track and visualize weight progress
- 📊 **Dashboard** – View calories, macros, meals, and progress
- 📱 **Responsive Web Design** – Modern interface for desktop and mobile devices

---

## 🖼️ Overview

<!-- Add your Caloriq screenshots here -->

<img width="1280" height="720" alt="caloriq-dashboard" src="YOUR_IMAGE_URL" />

<img width="1280" height="720" alt="caloriq-meals" src="YOUR_IMAGE_URL" />

<img width="1280" height="720" alt="caloriq-progress" src="YOUR_IMAGE_URL" />

---

## 🚀 Getting Started

### 🔐 Environment Variables Setup

Create a `.env` file in the **backend** folder:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_API_KEY=your_gemini_chat_api_key
GEMINI_MODEL=your_gemini_model
GEMINI_CHAT_MODEL=your_gemini_chat_model
```

Add `.env` to `.gitignore` to keep your credentials private.

### Prerequisites

Ensure you have:

- **Node.js** 18+
- **npm**
- **MongoDB** Atlas or local MongoDB
- **Gemini API key**

### Installation

🧬 **Clone the repository:**

```bash
git clone https://github.com/Kundan696922/caloriq.git
cd caloriq
```

### 🚀 Start the Backend

```bash
cd backend
npm install
npm run dev
```

### 💻 Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The web app will run at:

```text
http://localhost:5173
```
