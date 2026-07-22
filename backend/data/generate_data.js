const fs = require('fs');
const path = require('path');

const dataDir = 'c:/Users/MILAN/Desktop/IMD/backend/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const districts = [
  "Angul", "Balangir", "Baleshwar", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
  "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghapur", "Jajapur",
  "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
  "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangapur", "Nayagarh", "Nuapada",
  "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
];

// NOAA Heat Index calculation helper
function calculateHeatIndex(tempC, humidity) {
  // Convert Celsius to Fahrenheit
  const T = tempC * 9/5 + 32;
  const R = humidity;
  
  // High-level approximation for simple formula
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));
  
  if (T >= 80) {
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;
    
    let hiFull = c1 + c2*T + c3*R + c4*T*R + c5*T*T + c6*R*R + c7*T*T*R + c8*T*R*R + c9*T*T*R*R;
    
    // Adjustments
    if (R < 13 && T <= 112) {
      const adj = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      hiFull -= adj;
    } else if (R > 85 && T >= 80 && T <= 87) {
      const adj = ((R - 85) / 10) * ((87 - T) / 5);
      hiFull += adj;
    }
    
    // Only use full equation if it's over 80 Fahrenheit and differs
    if (hiFull >= 80) {
      HI = hiFull;
    }
  }
  
  // Convert back to Celsius
  const hiC = (HI - 32) * 5/9;
  return Math.round(hiC * 10) / 10;
}

function getRiskCategory(hiC) {
  if (hiC < 35) return "Normal";
  if (hiC < 41) return "Caution";
  if (hiC < 46) return "Extreme Caution";
  if (hiC <= 55) return "Danger";
  return "Extreme Danger";
}

// Generate historical data
console.log("Generating historical.csv...");
const histPath = path.join(dataDir, 'historical.csv');
const histStream = fs.createWriteStream(histPath);

// Write header
histStream.write("Date,District,Temperature,Humidity,WindSpeed,Pressure,Rainfall,HeatIndex,RiskCategory\n");

// Past 2 years: from 2024-07-01 to 2026-06-30
const startDate = new Date('2024-07-01');
const endDate = new Date('2026-06-30');

let count = 0;
for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateStr = d.toISOString().split('T')[0];
  const month = d.getMonth(); // 0 = Jan, 11 = Dec
  
  // Base climate logic for Odisha (Eastern India)
  // Summer: March-June (Months 2-5). Peak hot: May (4)
  // Monsoon: July-October (Months 6-9). Rain and high humidity.
  // Winter: Nov-Feb (Months 10, 11, 0, 1). Cool and dry.
  
  let season = 'winter';
  if (month >= 2 && month <= 5) season = 'summer';
  else if (month >= 6 && month <= 9) season = 'monsoon';
  
  districts.forEach(district => {
    // Add some random variation per district
    // e.g. Koraput is high altitude and cooler. Jharsuguda/Angul/Titlagarh (Balangir) are inland and extremely hot.
    let distTempOffset = 0;
    let distHumOffset = 0;
    
    if (district === "Koraput" || district === "Kandhamal") {
      distTempOffset = -4; // Cooler in hills
      distHumOffset = 5;
    } else if (district === "Jharsuguda" || district === "Angul" || district === "Balangir" || district === "Sambalpur") {
      distTempOffset = 3; // Inland hot zones
      distHumOffset = -5;
    } else if (district === "Puri" || district === "Ganjam" || district === "Jagatsinghapur" || district === "Kendrapara") {
      distTempOffset = -1; // Coastal, moderate temp
      distHumOffset = 8;  // High humidity
    }
    
    let baseTemp = 25;
    let baseHum = 60;
    let baseWind = 12;
    let basePres = 1010;
    let rainProb = 0.05;
    
    if (season === 'summer') {
      baseTemp = month === 4 ? 38 : 34; // May is hottest
      baseHum = month === 5 ? 70 : 45;  // June humidity rises
      baseWind = 14;
      basePres = 1004;
      rainProb = month === 5 ? 0.25 : 0.08; // Pre-monsoon showers in June
    } else if (season === 'monsoon') {
      baseTemp = 30;
      baseHum = 85;
      baseWind = 18;
      basePres = 1002;
      rainProb = 0.65; // High rain probability
    } else { // Winter
      baseTemp = month === 11 || month === 0 ? 20 : 23; // Dec, Jan are coolest
      baseHum = 50;
      baseWind = 8;
      basePres = 1015;
      rainProb = 0.02;
    }
    
    // Add random daily noise
    const tempNoise = (Math.random() - 0.5) * 6;
    const humNoise = (Math.random() - 0.5) * 15;
    const windNoise = (Math.random() - 0.5) * 8;
    const presNoise = (Math.random() - 0.5) * 4;
    
    const finalTemp = Math.round((baseTemp + distTempOffset + tempNoise) * 10) / 10;
    const finalHum = Math.min(100, Math.max(15, Math.round(baseHum + distHumOffset + humNoise)));
    const finalWind = Math.max(0, Math.round((baseWind + windNoise) * 10) / 10);
    const finalPres = Math.round(basePres + presNoise);
    
    let rainfall = 0;
    if (Math.random() < rainProb) {
      rainfall = Math.round((Math.random() * (season === 'monsoon' ? 45 : 12)) * 10) / 10;
    }
    
    const hi = calculateHeatIndex(finalTemp, finalHum);
    const risk = getRiskCategory(hi);
    
    histStream.write(`${dateStr},${district},${finalTemp},${finalHum},${finalWind},${finalPres},${rainfall},${hi},${risk}\n`);
    count++;
  });
}
histStream.end();
console.log(`Generated ${count} records in historical.csv.`);

// Generate a dummy initial weather.csv for today: 2026-07-01
console.log("Generating initial weather.csv...");
const weatherPath = path.join(dataDir, 'weather.csv');
const weatherStream = fs.createWriteStream(weatherPath);
weatherStream.write("Date,Time,District,Temperature,Humidity,WindSpeed,Pressure,Rainfall,HeatIndex,RiskCategory\n");

const todayStr = '2026-07-01';
const timeStr = '12:00:00';

districts.forEach(district => {
  let t = 32;
  let h = 80;
  if (district === "Koraput") { t = 27; h = 88; }
  else if (district === "Angul") { t = 36; h = 65; }
  const hi = calculateHeatIndex(t, h);
  const risk = getRiskCategory(hi);
  weatherStream.write(`${todayStr},${timeStr},${district},${t},${h},12.5,1006.0,0.0,${hi},${risk}\n`);
});
weatherStream.end();
console.log("Generated weather.csv");

// Generate a dummy initial forecast.csv
console.log("Generating initial forecast.csv...");
const forecastPath = path.join(dataDir, 'forecast.csv');
const forecastStream = fs.createWriteStream(forecastPath);
forecastStream.write("District,ForecastDate,PredictedTemperature,PredictedHeatIndex,Confidence\n");

// Write 7 days forecast for each district starting 2026-07-02
const startForecast = new Date('2026-07-02');
for (let i = 0; i < 7; i++) {
  const fDate = new Date(startForecast);
  fDate.setDate(startForecast.getDate() + i);
  const fDateStr = fDate.toISOString().split('T')[0];
  
  districts.forEach(district => {
    let baseT = 31;
    let baseH = 82;
    if (district === "Koraput") baseT = 27;
    else if (district === "Angul") baseT = 35;
    
    // Add small random change per forecast day
    const dayT = Math.round((baseT + (Math.random() - 0.5) * 2) * 10) / 10;
    const dayH = Math.min(100, Math.max(10, Math.round(baseH + (Math.random() - 0.5) * 6)));
    const hi = calculateHeatIndex(dayT, dayH);
    const confidence = Math.round((95 - i * 3) * 10) / 10; // lower confidence for future days
    
    forecastStream.write(`${district},${fDateStr},${dayT},${hi},${confidence}\n`);
  });
}
forecastStream.end();
console.log("Generated forecast.csv");
