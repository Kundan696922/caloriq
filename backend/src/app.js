const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/health.routes');
const calculatorRoutes = require('./routes/calculator.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
// with the other route imports at the top
const foodRoutes = require('./routes/food.routes');
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const weightRoutes = require("./routes/weight.routes");
const mealRoutes = require("./routes/meal.routes");
const chatRoutes = require("./routes/chat.routes");


const app = express();

// --- Core middleware ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- CORS ---
// CLIENT_URL supports a single origin or a comma-separated list, so both the
// local Vite dev server and the deployed Vercel frontend can be allowed.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// --- Routes ---
app.use('/api/health', healthRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use('/api/calculators', calculatorRoutes);
app.use('/api/foods', foodRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/weight", weightRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/chat", chatRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Caloriq API' });
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
