/**
 * District name mapper — aligns GeoJSON / display names with backend standard names.
 */
const GEO_TO_STANDARD = {
  Angul: 'Angul',
  Balangir: 'Balangir',
  Baleshwar: 'Baleshwar',
  Bargarh: 'Bargarh',
  Bhadrak: 'Bhadrak',
  Boudh: 'Boudh',
  Cuttack: 'Cuttack',
  Debagarh: 'Debagarh',
  Dhenkanal: 'Dhenkanal',
  Gajapati: 'Gajapati',
  Ganjam: 'Ganjam',
  Jagatsinghapur: 'Jagatsinghapur',
  Jajapur: 'Jajapur',
  Jharsuguda: 'Jharsuguda',
  Kalahandi: 'Kalahandi',
  Kandhamal: 'Kandhamal',
  Kendrapara: 'Kendrapara',
  Kendujhar: 'Kendujhar',
  Khordha: 'Khordha',
  Koraput: 'Koraput',
  Malkangiri: 'Malkangiri',
  Mayurbhanj: 'Mayurbhanj',
  Nabarangapur: 'Nabarangapur',
  Nayagarh: 'Nayagarh',
  Nuapada: 'Nuapada',
  Puri: 'Puri',
  Rayagada: 'Rayagada',
  Sambalpur: 'Sambalpur',
  Subarnapur: 'Subarnapur',
  Sundargarh: 'Sundargarh',
};

const DISPLAY_NAMES = {
  Baleshwar: 'Balasore',
  Debagarh: 'Deogarh',
  Jagatsinghapur: 'Jagatsinghpur',
  Jajapur: 'Jajpur',
  Nabarangapur: 'Nabarangpur',
};

const OPENWEATHER_ALIASES = {
  Baleshwar: 'Balasore',
  Debagarh: 'Deogarh',
  Jajapur: 'Jajpur',
  Boudh: 'Baudh',
};

function toStandardName(name) {
  return GEO_TO_STANDARD[name] || name;
}

function toDisplayName(name) {
  return DISPLAY_NAMES[name] || name;
}

function toOpenWeatherCity(name) {
  return OPENWEATHER_ALIASES[name] || name;
}

module.exports = {
  GEO_TO_STANDARD,
  DISPLAY_NAMES,
  toStandardName,
  toDisplayName,
  toOpenWeatherCity,
};
