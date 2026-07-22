/**
 * Weather Service to handle fetching from OpenWeather API or Fallback Mock Data
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { calculateHeatIndex } = require('./heatIndexService');

// Map of standard district name to OpenWeather Query City and coordinates
// This enables realistic fallback and accurate OpenWeather queries
const districtHeadquarters = {
  "Angul": { city: "Angul", lat: 20.84, lon: 85.10 },
  "Balangir": { city: "Balangir", lat: 20.72, lon: 83.48 },
  "Baleshwar": { city: "Balasore", lat: 21.49, lon: 86.93 },
  "Bargarh": { city: "Bargarh", lat: 21.33, lon: 83.62 },
  "Bhadrak": { city: "Bhadrak", lat: 21.06, lon: 86.51 },
  "Boudh": { city: "Baudh", lat: 20.84, lon: 84.32 },
  "Cuttack": { city: "Cuttack", lat: 20.46, lon: 85.88 },
  "Debagarh": { city: "Debagarh", lat: 21.53, lon: 84.73 },
  "Dhenkanal": { city: "Dhenkanal", lat: 20.66, lon: 85.60 },
  "Gajapati": { city: "Parlakhemundi", lat: 18.78, lon: 84.09 },
  "Ganjam": { city: "Chhatrapur", lat: 19.35, lon: 84.99 },
  "Jagatsinghapur": { city: "Jagatsinghapur", lat: 20.27, lon: 86.17 },
  "Jajapur": { city: "Jajpur", lat: 20.85, lon: 86.33 },
  "Jharsuguda": { city: "Jharsuguda", lat: 21.86, lon: 84.03 },
  "Kalahandi": { city: "Bhawanipatna", lat: 20.01, lon: 83.16 },
  "Kandhamal": { city: "Phulbani", lat: 20.47, lon: 84.23 },
  "Kendrapara": { city: "Kendrapara", lat: 20.50, lon: 86.42 },
  "Kendujhar": { city: "Kendujhar", lat: 21.63, lon: 85.60 },
  "Khordha": { city: "Bhubaneswar", lat: 20.30, lon: 85.82 },
  "Koraput": { city: "Koraput", lat: 18.81, lon: 82.71 },
  "Malkangiri": { city: "Malkangiri", lat: 18.34, lon: 81.88 },
  "Mayurbhanj": { city: "Baripada", lat: 21.94, lon: 86.72 },
  "Nabarangapur": { city: "Nabarangapur", lat: 19.23, lon: 82.55 },
  "Nayagarh": { city: "Nayagarh", lat: 20.13, lon: 85.10 },
  "Nuapada": { city: "Nuapada", lat: 20.14, lon: 82.53 },
  "Puri": { city: "Puri", lat: 19.81, lon: 85.82 },
  "Rayagada": { city: "Rayagada", lat: 19.17, lon: 83.42 },
  "Sambalpur": { city: "Sambalpur", lat: 21.47, lon: 83.97 },
  "Subarnapur": { city: "Sonapur", lat: 20.84, lon: 83.72 },
  "Sundargarh": { city: "Sundargarh", lat: 22.12, lon: 84.04 }
};

const districts = Object.keys(districtHeadquarters);
const dataDir = path.join(__dirname, '..', 'data');
const weatherCsvPath = path.join(dataDir, 'weather.csv');

// Load API Key
const API_KEY = process.env.OPENWEATHER_API_KEY || null;

/**
 * Simulates weather data for a district based on the current season/month.
 */
function simulateWeather(district) {
  const hq = districtHeadquarters[district];
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  
  let season = 'winter';
  if (month >= 2 && month <= 5) season = 'summer';
  else if (month >= 6 && month <= 9) season = 'monsoon';

  let distTempOffset = 0;
  let distHumOffset = 0;

  // District specific offsets
  if (district === "Koraput" || district === "Kandhamal") {
    distTempOffset = -4; // Hilly cool zones
    distHumOffset = 5;
  } else if (["Jharsuguda", "Angul", "Balangir", "Sambalpur"].includes(district)) {
    distTempOffset = 3;  // Inland extreme zones
    distHumOffset = -5;
  } else if (["Puri", "Ganjam", "Jagatsinghapur", "Kendrapara", "Baleshwar"].includes(district)) {
    distTempOffset = -1; // Coastal moderate zones
    distHumOffset = 8;
  }

  let baseTemp = 25;
  let baseHum = 60;
  let baseWind = 12;
  let basePres = 1010;
  let rainProb = 0.05;

  if (season === 'summer') {
    baseTemp = month === 4 ? 38 : 34; // May is peak hot
    baseHum = month === 5 ? 70 : 45;
    baseWind = 14;
    basePres = 1004;
    rainProb = month === 5 ? 0.25 : 0.08;
  } else if (season === 'monsoon') {
    baseTemp = 30;
    baseHum = 85;
    baseWind = 18;
    basePres = 1002;
    rainProb = 0.65;
  } else { // Winter
    baseTemp = [11, 0].includes(month) ? 20 : 23; // Dec, Jan are coolest
    baseHum = 50;
    baseWind = 8;
    basePres = 1015;
    rainProb = 0.02;
  }

  // Daily fluctuations based on current time (warmer in afternoon)
  const hour = now.getHours();
  let timeOffset = -3; // night/early morning
  if (hour >= 10 && hour <= 16) {
    timeOffset = 4; // afternoon peak
  } else if (hour >= 17 && hour <= 21) {
    timeOffset = 1; // evening cooling
  }

  const tempNoise = (Math.random() - 0.5) * 4;
  const humNoise = (Math.random() - 0.5) * 10;
  const windNoise = (Math.random() - 0.5) * 6;

  const temp = Math.round((baseTemp + distTempOffset + timeOffset + tempNoise) * 10) / 10;
  const humidity = Math.min(100, Math.max(15, Math.round(baseHum + distHumOffset + humNoise)));
  const windSpeed = Math.round(Math.max(0, baseWind + windNoise) * 10) / 10;
  const pressure = Math.round(basePres + (Math.random() - 0.5) * 4);
  const rainfall = Math.random() < rainProb ? Math.round(Math.random() * (season === 'monsoon' ? 25 : 5) * 10) / 10 : 0;

  const hiData = calculateHeatIndex(temp, humidity);

  return {
    district,
    temperature: temp,
    humidity,
    windSpeed,
    pressure,
    rainfall,
    heatIndex: hiData.heatIndex,
    riskCategory: hiData.riskCategory,
    alertLevel: hiData.alertLevel
  };
}

/**
 * Fetches current weather for a district from OpenWeather API
 */
async function fetchDistrictWeatherFromApi(district) {
  const hq = districtHeadquarters[district];
  // We use coordinates (lat, lon) for precise query, falling back to name
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${hq.lat}&lon=${hq.lon}&appid=${API_KEY}&units=metric`;
  
  try {
    const res = await axios.get(url);
    const data = res.data;
    
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed * 3.6; // convert m/s to km/h
    const pressure = data.main.pressure;
    const rainfall = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;
    
    const hiData = calculateHeatIndex(temp, humidity);
    
    return {
      district,
      temperature: Math.round(temp * 10) / 10,
      humidity,
      windSpeed: Math.round(windSpeed * 10) / 10,
      pressure,
      rainfall: Math.round(rainfall * 10) / 10,
      heatIndex: hiData.heatIndex,
      riskCategory: hiData.riskCategory,
      alertLevel: hiData.alertLevel
    };
  } catch (err) {
    console.warn(`Failed to fetch API weather for ${district}, using simulated data. Reason: ${err.message}`);
    return simulateWeather(district);
  }
}

/**
 * Fetch weather for all 30 districts
 */
async function fetchAllWeather() {
  const promises = districts.map(async (district) => {
    if (API_KEY) {
      // Throttle slightly to respect API limits if needed, but standard key allows multi-threading
      return fetchDistrictWeatherFromApi(district);
    } else {
      return simulateWeather(district);
    }
  });

  const results = await Promise.all(promises);
  
  // Log results to weather.csv
  writeWeatherToCsv(results);
  
  return results;
}

/**
 * Appends current weather records to weather.csv
 */
function writeWeatherToCsv(records) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  const header = "Date,Time,District,Temperature,Humidity,WindSpeed,Pressure,Rainfall,HeatIndex,RiskCategory\n";
  const fileExists = fs.existsSync(weatherCsvPath);

  let stream;
  if (!fileExists) {
    fs.mkdirSync(dataDir, { recursive: true });
    stream = fs.createWriteStream(weatherCsvPath);
    stream.write(header);
  } else {
    stream = fs.createWriteStream(weatherCsvPath, { flags: 'a' });
  }

  records.forEach(r => {
    stream.write(`${dateStr},${timeStr},${r.district},${r.temperature},${r.humidity},${r.windSpeed},${r.pressure},${r.rainfall},${r.heatIndex},${r.riskCategory}\n`);
  });
  stream.end();
}

/**
 * Reads the latest weather records from weather.csv (one per district)
 */
function getLatestWeather() {
  if (!fs.existsSync(weatherCsvPath)) {
    return districts.map(d => simulateWeather(d));
  }

  const fileContent = fs.readFileSync(weatherCsvPath, 'utf8');
  const lines = fileContent.trim().split('\n');
  if (lines.length <= 1) {
    return districts.map(d => simulateWeather(d));
  }

  // Get headers
  const headers = lines[0].split(',');
  
  // Map to store latest record per district
  const latestByDistrict = {};

  // Read backwards to get the most recent entry
  for (let i = lines.length - 1; i >= 1; i--) {
    const line = lines[i];
    if (!line) continue;
    const values = line.split(',');
    
    // Create record object
    const record = {};
    headers.forEach((h, idx) => {
      record[h.trim()] = values[idx] ? values[idx].trim() : '';
    });

    const district = record.District;
    if (district && !latestByDistrict[district]) {
      const temp = parseFloat(record.Temperature);
      const humidity = parseInt(record.Humidity);
      const windSpeed = parseFloat(record.WindSpeed);
      const pressure = parseInt(record.Pressure);
      const rainfall = parseFloat(record.Rainfall);
      const hi = parseFloat(record.HeatIndex);
      
      const hiData = calculateHeatIndex(temp, humidity); // Recalculate or use CSV data

      latestByDistrict[district] = {
        date: record.Date,
        time: record.Time,
        district: district,
        temperature: temp,
        humidity: humidity,
        windSpeed: windSpeed,
        pressure: pressure,
        rainfall: rainfall,
        heatIndex: hi,
        riskCategory: record.RiskCategory || hiData.riskCategory,
        alertLevel: hiData.alertLevel
      };
    }

    // Stop if we have all 30 districts
    if (Object.keys(latestByDistrict).length === districts.length) {
      break;
    }
  }

  // Fill in missing districts if any
  districts.forEach(d => {
    if (!latestByDistrict[d]) {
      latestByDistrict[d] = simulateWeather(d);
    }
  });

  return Object.values(latestByDistrict);
}

module.exports = {
  fetchAllWeather,
  getLatestWeather,
  districts,
  districtHeadquarters
};
