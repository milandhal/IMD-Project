const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getLatestWeather, fetchAllWeather } = require('../services/weatherService');
const {
  getDashboardStats,
  getHistoricalData,
  getForecastData,
  getAlerts
} = require('../controllers/dashboardController');

// In-memory cache for weather data
let weatherCache = null;
let lastFetchTime = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

async function getWeatherWithCache() {
  const now = Date.now();
  if (!weatherCache || !lastFetchTime || now - lastFetchTime > CACHE_DURATION_MS) {
    try {
      weatherCache = await fetchAllWeather();
      lastFetchTime = now;
    } catch (err) {
      console.error('Weather fetch failed, using cached/CSV data:', err.message);
      if (!weatherCache) {
        weatherCache = getLatestWeather();
        lastFetchTime = now;
      }
    }
  }
  return weatherCache;
}

// GET /api/live-weather — fetch current weather for all 30 districts
router.get('/live-weather', async (req, res) => {
  try {
    const weather = await getWeatherWithCache();
    res.json({
      success: true,
      lastUpdated: new Date(lastFetchTime).toISOString(),
      data: weather
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dashboard — full dashboard KPI, rankings, distribution
router.get('/dashboard', async (req, res) => {
  try {
    const weather = await getWeatherWithCache();
    const stats = getDashboardStats(weather);
    res.json({
      success: true,
      lastUpdated: new Date(lastFetchTime || Date.now()).toISOString(),
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/alerts — current active alerts
router.get('/alerts', async (req, res) => {
  try {
    const weather = await getWeatherWithCache();
    const alerts = getAlerts(weather);
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/forecast — forecast data, optional ?district=Angul
router.get('/forecast', (req, res) => {
  try {
    const { district } = req.query;
    const forecasts = getForecastData(district);
    res.json({
      success: true,
      count: forecasts.length,
      data: forecasts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ml-metrics — ML model accuracy from metrics.json
router.get('/ml-metrics', (req, res) => {
  try {
    const metricsPath = path.join(__dirname, '..', '..', 'ml', 'metrics.json');
    if (!fs.existsSync(metricsPath)) {
      return res.json({
        success: true,
        data: { temp_r2: 0.959, hi_r2: 0.910, source: 'default' }
      });
    }
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/historical — historical analysis, optional ?district=Angul
router.get('/historical', (req, res) => {
  try {
    const { district } = req.query;
    const historical = getHistoricalData({ district });
    res.json({
      success: true,
      data: historical
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/refresh — force a fresh fetch from OpenWeather
router.get('/refresh', async (req, res) => {
  try {
    lastFetchTime = null;
    weatherCache = null;
    const weather = await getWeatherWithCache();
    const stats = getDashboardStats(weather);
    res.json({
      success: true,
      message: 'Data refreshed successfully',
      lastUpdated: new Date(lastFetchTime).toISOString(),
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
