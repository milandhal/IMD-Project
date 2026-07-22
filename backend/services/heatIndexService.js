/**
 * NOAA Heat Index Calculation Service
 */

/**
 * Calculates Heat Index in Celsius based on Temperature (°C) and Relative Humidity (%)
 * @param {number} tempC - Temperature in Celsius
 * @param {number} humidity - Relative Humidity percentage (0-100)
 * @returns {object} Object containing HeatIndex, RiskCategory, and AlertLevel
 */
function calculateHeatIndex(tempC, humidity) {
  // Convert Celsius to Fahrenheit
  const T = tempC * 9 / 5 + 32;
  const R = humidity;

  // For cooler temperatures (below 80°F / ~26.7°C), use simple heat index formula
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));

  // If simple formula results in 80°F or higher, apply full Rothfusz regression equation
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

    let hiFull = c1 + c2 * T + c3 * R + c4 * T * R + c5 * T * T + c6 * R * R + c7 * T * T * R + c8 * T * R * R + c9 * T * T * R * R;

    // Adjustments
    if (R < 13 && T >= 80 && T <= 112) {
      const adj = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      hiFull -= adj;
    } else if (R > 85 && T >= 80 && T <= 87) {
      const adj = ((R - 85) / 10) * ((87 - T) / 5);
      hiFull += adj;
    }

    if (hiFull >= 80) {
      HI = hiFull;
    }
  }

  // Convert back to Celsius
  const hiC = (HI - 32) * 5 / 9;
  const finalHI = Math.round(hiC * 10) / 10;

  // Determine Risk Category and Alert Level
  let risk = "Normal";
  let alert = "No Alert";

  if (finalHI > 55) {
    risk = "Extreme Danger";
    alert = "Red Alert (Take Action / Extreme Danger)";
  } else if (finalHI >= 46) {
    risk = "Danger";
    alert = "Orange Alert (Be Prepared / Danger)";
  } else if (finalHI >= 41) {
    risk = "Extreme Caution";
    alert = "Yellow Alert (Be Updated / Extreme Caution)";
  } else if (finalHI >= 35) {
    risk = "Caution";
    alert = "Yellow Alert (Be Updated / Caution)";
  }

  return {
    heatIndex: finalHI,
    riskCategory: risk,
    alertLevel: alert
  };
}

module.exports = {
  calculateHeatIndex
};
