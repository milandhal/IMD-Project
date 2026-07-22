/**
 * Dashboard Controller — Computes KPI metrics, district rankings, risk distribution,
 * and historical analysis from CSV data.
 */
const path = require('path');
const { readCsvSync } = require('../utils/csvHelper');
const { calculateHeatIndex } = require('../services/heatIndexService');

const dataDir = path.join(__dirname, '..', 'data');

function getDashboardStats(weatherData) {
  if (!weatherData || weatherData.length === 0) return null;

  // Sort by heat index descending
  const sorted = [...weatherData].sort((a, b) => b.heatIndex - a.heatIndex);

  const temps = weatherData.map(d => d.temperature).filter(v => !isNaN(v));
  const heatIndices = weatherData.map(d => d.heatIndex).filter(v => !isNaN(v));
  const humidities = weatherData.map(d => d.humidity).filter(v => !isNaN(v));
  const windSpeeds = weatherData.map(d => d.windSpeed).filter(v => !isNaN(v));

  const maxTemp = Math.max(...temps);
  const avgTemp = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
  const maxHI = Math.max(...heatIndices);
  const avgHI = Math.round((heatIndices.reduce((a, b) => a + b, 0) / heatIndices.length) * 10) / 10;
  const avgHum = Math.round((humidities.reduce((a, b) => a + b, 0) / humidities.length) * 10) / 10;
  const avgWind = Math.round((windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) * 10) / 10;

  const highestRisk = sorted[0];
  const activeAlerts = weatherData.filter(d => d.riskCategory && d.riskCategory !== 'Normal').length;

  // Risk distribution
  const riskCounts = { 'Normal': 0, 'Caution': 0, 'Extreme Caution': 0, 'Danger': 0, 'Extreme Danger': 0 };
  weatherData.forEach(d => {
    const cat = d.riskCategory || 'Normal';
    if (riskCounts.hasOwnProperty(cat)) riskCounts[cat]++;
    else riskCounts['Normal']++;
  });

  return {
    kpi: {
      maxTemperature: maxTemp,
      avgTemperature: avgTemp,
      maxHeatIndex: maxHI,
      avgHeatIndex: avgHI,
      highestRiskDistrict: highestRisk ? highestRisk.district : 'N/A',
      highestRiskDistrictHI: highestRisk ? highestRisk.heatIndex : 0,
      highestRiskCategory: highestRisk ? highestRisk.riskCategory : 'Normal',
      activeAlerts,
      avgHumidity: avgHum,
      avgWindSpeed: avgWind,
      monitoringDistricts: weatherData.length,
      lastUpdated: new Date().toISOString()
    },
    districtRankings: sorted.slice(0, 10).map(d => ({
      district: d.district,
      temperature: d.temperature,
      heatIndex: d.heatIndex,
      humidity: d.humidity,
      windSpeed: d.windSpeed,
      riskCategory: d.riskCategory,
      alertLevel: d.alertLevel
    })),
    riskDistribution: Object.entries(riskCounts).map(([name, value]) => ({ name, value })),
    allDistricts: weatherData
  };
}

function getHistoricalData(filters = {}) {
  const histPath = path.join(dataDir, 'historical.csv');
  let records = readCsvSync(histPath);

  if (!records.length) return { daily: [], monthly: [], seasonal: [] };

  // Convert types
  records = records.map(r => ({
    ...r,
    Temperature: parseFloat(r.Temperature),
    Humidity: parseFloat(r.Humidity),
    WindSpeed: parseFloat(r.WindSpeed),
    Pressure: parseFloat(r.Pressure),
    HeatIndex: parseFloat(r.HeatIndex),
    Rainfall: parseFloat(r.Rainfall)
  }));

  // Filter by district if provided
  if (filters.district && filters.district !== 'All') {
    records = records.filter(r => r.District === filters.district);
  }

  // Daily averages — last 90 days
  const dates = [...new Set(records.map(r => r.Date))].sort().reverse().slice(0, 90).reverse();
  const daily = dates.map(date => {
    const dayRecords = records.filter(r => r.Date === date);
    const avgTemp = dayRecords.reduce((a, b) => a + b.Temperature, 0) / dayRecords.length;
    const avgHI = dayRecords.reduce((a, b) => a + b.HeatIndex, 0) / dayRecords.length;
    const avgHum = dayRecords.reduce((a, b) => a + b.Humidity, 0) / dayRecords.length;
    const avgWind = dayRecords.reduce((a, b) => a + b.WindSpeed, 0) / dayRecords.length;
    const maxTemp = Math.max(...dayRecords.map(r => r.Temperature));
    return {
      date,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      avgHeatIndex: Math.round(avgHI * 10) / 10,
      avgHumidity: Math.round(avgHum * 10) / 10,
      avgWindSpeed: Math.round(avgWind * 10) / 10,
      maxTemperature: Math.round(maxTemp * 10) / 10
    };
  });

  // Monthly aggregation
  const monthlyMap = {};
  records.forEach(r => {
    const month = r.Date ? r.Date.substring(0, 7) : 'Unknown'; // YYYY-MM
    if (!monthlyMap[month]) monthlyMap[month] = { temps: [], heatIndices: [], humidities: [] };
    monthlyMap[month].temps.push(r.Temperature);
    monthlyMap[month].heatIndices.push(r.HeatIndex);
    monthlyMap[month].humidities.push(r.Humidity);
  });
  const monthly = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({
    month,
    avgTemperature: Math.round((data.temps.reduce((a, b) => a + b, 0) / data.temps.length) * 10) / 10,
    maxTemperature: Math.round(Math.max(...data.temps) * 10) / 10,
    avgHeatIndex: Math.round((data.heatIndices.reduce((a, b) => a + b, 0) / data.heatIndices.length) * 10) / 10,
    avgHumidity: Math.round((data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length) * 10) / 10
  }));

  // Seasonal
  const seasonMap = {};
  records.forEach(r => {
    const m = r.Date ? parseInt(r.Date.split('-')[1]) : 0;
    const year = r.Date ? r.Date.split('-')[0] : 'Unknown';
    let season = 'Winter';
    if (m >= 3 && m <= 5) season = 'Summer';
    else if (m >= 6 && m <= 9) season = 'Monsoon';
    const key = `${year}-${season}`;
    if (!seasonMap[key]) seasonMap[key] = { label: `${season} ${year}`, temps: [], heatIndices: [] };
    seasonMap[key].temps.push(r.Temperature);
    seasonMap[key].heatIndices.push(r.HeatIndex);
  });
  const seasonal = Object.values(seasonMap).map(s => ({
    label: s.label,
    avgTemperature: Math.round((s.temps.reduce((a, b) => a + b, 0) / s.temps.length) * 10) / 10,
    avgHeatIndex: Math.round((s.heatIndices.reduce((a, b) => a + b, 0) / s.heatIndices.length) * 10) / 10
  }));

  return { daily, monthly, seasonal };
}

function getForecastData(district = null) {
  const forecastPath = path.join(dataDir, 'forecast.csv');
  let records = readCsvSync(forecastPath);
  if (!records.length) return [];

  if (district && district !== 'All') {
    records = records.filter(r => r.District === district);
  }

  return records.map(r => ({
    district: r.District,
    forecastDate: r.ForecastDate,
    predictedTemperature: parseFloat(r.PredictedTemperature),
    predictedHeatIndex: parseFloat(r.PredictedHeatIndex),
    confidence: parseFloat(r.Confidence),
    riskCategory: getRiskFromHI(parseFloat(r.PredictedHeatIndex))
  }));
}

function getAlerts(weatherData) {
  const alerts = weatherData
    .filter(d => d.riskCategory && d.riskCategory !== 'Normal')
    .map(d => ({
      district: d.district,
      temperature: d.temperature,
      humidity: d.humidity,
      heatIndex: d.heatIndex,
      riskCategory: d.riskCategory,
      alertLevel: d.alertLevel,
      updatedAt: new Date().toISOString()
    }))
    .sort((a, b) => b.heatIndex - a.heatIndex);
  return alerts;
}

function getRiskFromHI(hi) {
  if (hi > 55) return 'Extreme Danger';
  if (hi >= 46) return 'Danger';
  if (hi >= 41) return 'Extreme Caution';
  if (hi >= 35) return 'Caution';
  return 'Normal';
}

module.exports = {
  getDashboardStats,
  getHistoricalData,
  getForecastData,
  getAlerts
};
