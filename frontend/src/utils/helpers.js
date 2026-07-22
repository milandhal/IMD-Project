/**
 * Utility helpers for the Odisha Heat Index Dashboard
 */

// GeoJSON district name → standard district name map
export const GEO_TO_STANDARD = {
  "Angul": "Angul",
  "Balangir": "Balangir",
  "Baleshwar": "Baleshwar",
  "Bargarh": "Bargarh",
  "Bhadrak": "Bhadrak",
  "Boudh": "Boudh",
  "Cuttack": "Cuttack",
  "Debagarh": "Debagarh",
  "Dhenkanal": "Dhenkanal",
  "Gajapati": "Gajapati",
  "Ganjam": "Ganjam",
  "Jagatsinghapur": "Jagatsinghapur",
  "Jajapur": "Jajapur",
  "Jharsuguda": "Jharsuguda",
  "Kalahandi": "Kalahandi",
  "Kandhamal": "Kandhamal",
  "Kendrapara": "Kendrapara",
  "Kendujhar": "Kendujhar",
  "Khordha": "Khordha",
  "Koraput": "Koraput",
  "Malkangiri": "Malkangiri",
  "Mayurbhanj": "Mayurbhanj",
  "Nabarangapur": "Nabarangapur",
  "Nayagarh": "Nayagarh",
  "Nuapada": "Nuapada",
  "Puri": "Puri",
  "Rayagada": "Rayagada",
  "Sambalpur": "Sambalpur",
  "Subarnapur": "Subarnapur",
  "Sundargarh": "Sundargarh"
};

// Standard name → display name (for UI)
export const DISPLAY_NAMES = {
  "Baleshwar": "Balasore",
  "Debagarh": "Deogarh",
  "Jagatsinghapur": "Jagatsinghpur",
  "Jajapur": "Jajpur",
  "Nabarangapur": "Nabarangpur",
};

export const getDisplayName = (district) => DISPLAY_NAMES[district] || district;

// Risk categories metadata
export const RISK_METADATA = {
  "Normal":          { color: "#16a34a", bgColor: "#dcfce7", border: "#86efac", label: "Normal",          icon: "🟢" },
  "Caution":         { color: "#ca8a04", bgColor: "#fef9c3", border: "#fde047", label: "Caution",         icon: "🟡" },
  "Extreme Caution": { color: "#ea580c", bgColor: "#ffedd5", border: "#fdba74", label: "Extreme Caution", icon: "🟠" },
  "Danger":          { color: "#dc2626", bgColor: "#fee2e2", border: "#fca5a5", label: "Danger",           icon: "🔴" },
  "Extreme Danger":  { color: "#7f1d1d", bgColor: "#fef2f2", border: "#fca5a5", label: "Extreme Danger",  icon: "🔴" },
};

export const getRiskColor = (riskCategory) =>
  RISK_METADATA[riskCategory]?.color || RISK_METADATA["Normal"].color;

export const getRiskBgColor = (riskCategory) =>
  RISK_METADATA[riskCategory]?.bgColor || RISK_METADATA["Normal"].bgColor;

// Get Leaflet map fill color based on heat index value
export const getMapColor = (heatIndex) => {
  if (heatIndex === null || heatIndex === undefined) return '#94a3b8';
  if (heatIndex > 55) return '#7f1d1d';
  if (heatIndex >= 46) return '#dc2626';
  if (heatIndex >= 41) return '#ea580c';
  if (heatIndex >= 35) return '#ca8a04';
  return '#16a34a';
};

// Risk category from heat index
export const getRiskFromHI = (hi) => {
  if (hi > 55) return 'Extreme Danger';
  if (hi >= 46) return 'Danger';
  if (hi >= 41) return 'Extreme Caution';
  if (hi >= 35) return 'Caution';
  return 'Normal';
};

// Format date/time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// CSV export
export function downloadCsv(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Chart tooltip style
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#e2e8f0',
  fontSize: '12px',
  padding: '8px 12px'
};
