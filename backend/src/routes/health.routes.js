const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(200).json({
    success: true,
    message: 'Caloriq API is running',
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState] || 'unknown',
  });
});

module.exports = router;
