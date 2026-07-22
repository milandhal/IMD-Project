require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetchAllWeather } = require('./services/weatherService');

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Odisha Heat Index API', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌡️  Odisha Heat Index API Server`);
  console.log(`✅  Running on http://localhost:${PORT}`);
  console.log(`📡  OpenWeather API Key: ${process.env.OPENWEATHER_API_KEY ? 'Configured ✓' : 'Not set — using simulation mode'}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET /api/live-weather`);
  console.log(`  GET /api/dashboard`);
  console.log(`  GET /api/alerts`);
  console.log(`  GET /api/forecast`);
  console.log(`  GET /api/historical`);
  console.log(`  GET /api/ml-metrics`);
  console.log(`  GET /api/refresh\n`);

  // Pre-fetch weather on startup
  fetchAllWeather().catch(err => console.warn('Initial weather fetch failed:', err.message));
});
