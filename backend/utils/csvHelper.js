const fs = require('fs');
const path = require('path');

/**
 * Reads a CSV file and parses it into an array of JSON objects.
 * Synchronous and robust for standard comma-separated lines.
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Array<object>} Array of parsed objects
 */
function readCsvSync(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`CSV File not found at: ${filePath}`);
    return [];
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const values = [];
      let currentVal = '';
      let insideQuotes = false;

      // Handle standard CSV commas with potential quotes
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] !== undefined ? values[index] : '';
      });
      data.push(record);
    }

    return data;
  } catch (err) {
    console.error(`Error reading CSV at ${filePath}:`, err.message);
    return [];
  }
}

module.exports = {
  readCsvSync
};
