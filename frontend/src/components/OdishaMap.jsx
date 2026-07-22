import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { getMapColor, getRiskColor, getRiskBgColor, GEO_TO_STANDARD, getDisplayName } from '../utils/helpers';

const ODISHA_CENTER = [20.9, 84.0];

function DistrictStyle(heatIndex) {
  return {
    fillColor: getMapColor(heatIndex),
    weight: 1.5,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.78,
  };
}

function DistrictHoverStyle(heatIndex) {
  return {
    fillColor: getMapColor(heatIndex),
    weight: 3,
    opacity: 1,
    color: '#fff',
    fillOpacity: 0.95,
  };
}

const LEGEND_ITEMS = [
  { label: 'Normal (<35°C)',         color: '#16a34a' },
  { label: 'Caution (35–40°C)',      color: '#ca8a04' },
  { label: 'Extreme Caution (41–45°C)', color: '#ea580c' },
  { label: 'Danger (46–55°C)',       color: '#dc2626' },
  { label: 'Extreme Danger (>55°C)', color: '#7f1d1d' },
];

function Legend({ darkMode }) {
  return (
    <div className={`absolute bottom-6 right-4 z-[999] p-3 rounded-xl shadow-lg border
      ${darkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}
    >
      <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-700'}`}>Heat Index Scale</p>
      {LEGEND_ITEMS.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
          <span className={`text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function OdishaMap({ height = 460, className = '' }) {
  const { liveWeather, darkMode, loading } = useApp();
  const [geoJson, setGeoJson] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  // Build lookup: district name → weather data
  const weatherByDistrict = useMemo(() => {
    const map = {};
    if (liveWeather) {
      liveWeather.forEach(d => { map[d.district] = d; });
    }
    return map;
  }, [liveWeather]);

  useEffect(() => {
    fetch('/odisha.geojson')
      .then(r => r.json())
      .then(data => setGeoJson(data))
      .catch(e => console.error('Failed to load GeoJSON:', e));
  }, []);

  // Re-mount map when weather changes to reapply colors
  useEffect(() => {
    if (liveWeather?.length > 0) {
      setMapKey(k => k + 1);
    }
  }, [liveWeather]);

  const onEachFeature = (feature, layer) => {
    const distName = feature.properties.Dist_Name;
    const standardName = GEO_TO_STANDARD[distName] || distName;
    const weather = weatherByDistrict[standardName];
    const hi = weather?.heatIndex ?? null;
    const riskCat = weather?.riskCategory ?? 'Normal';
    const riskColor = getRiskColor(riskCat);

    layer.setStyle(DistrictStyle(hi));

    layer.on({
      mouseover: (e) => {
        e.target.setStyle(DistrictHoverStyle(hi));
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(DistrictStyle(hi));
      }
    });

    // Tooltip
    layer.bindTooltip(
      `<div style="padding:4px 8px; font-family:Inter,sans-serif;">
        <strong style="font-size:13px; color:#1e293b;">${getDisplayName(standardName)}</strong><br/>
        <span style="font-size:11px; color:${riskColor}; font-weight:600;">${riskCat}</span>
        ${hi !== null ? `<br/><span style="font-size:11px; color:#64748b;">HI: ${hi}°C</span>` : ''}
      </div>`,
      { permanent: false, sticky: true, direction: 'auto', opacity: 0.97 }
    );

    // Popup
    layer.bindPopup(
      `<div style="font-family:Inter,sans-serif; min-width:220px;">
        <div style="background:linear-gradient(135deg,#005A9C,#0070ba); color:white; margin:-12px -12px 10px; padding:10px 14px; border-radius:10px 10px 0 0;">
          <strong style="font-size:14px;">🗺️ ${getDisplayName(standardName)}</strong>
          <div style="font-size:11px; margin-top:2px; opacity:0.85;">District — Odisha</div>
        </div>
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
          <tr><td style="color:#64748b; padding:3px 0;">🌡️ Temperature</td><td style="font-weight:600; text-align:right;">${weather?.temperature ?? 'N/A'}°C</td></tr>
          <tr><td style="color:#64748b; padding:3px 0;">💧 Humidity</td><td style="font-weight:600; text-align:right;">${weather?.humidity ?? 'N/A'}%</td></tr>
          <tr><td style="color:#64748b; padding:3px 0;">💨 Wind Speed</td><td style="font-weight:600; text-align:right;">${weather?.windSpeed ?? 'N/A'} km/h</td></tr>
          <tr><td style="color:#64748b; padding:3px 0;">📊 Pressure</td><td style="font-weight:600; text-align:right;">${weather?.pressure ?? 'N/A'} hPa</td></tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="color:#64748b; padding:5px 0 3px; font-weight:600;">🔥 Heat Index</td>
            <td style="font-weight:700; color:${riskColor}; text-align:right; font-size:14px;">${hi ?? 'N/A'}°C</td>
          </tr>
          <tr>
            <td style="color:#64748b; padding:2px 0;">⚠️ Risk</td>
            <td style="text-align:right;">
              <span style="color:${riskColor}; font-weight:700; font-size:12px;">${riskCat}</span>
            </td>
          </tr>
        </table>
        <div style="margin-top:10px; padding:6px 10px; border-radius:8px; background:${getRiskBgColor(riskCat)}; color:${riskColor}; font-size:11px; font-weight:600; text-align:center;">
          ${weather?.alertLevel || 'No Active Alert'}
        </div>
      </div>`,
      { maxWidth: 280, className: '' }
    );
  };

  if (loading || !geoJson) {
    return (
      <div
        className={`w-full rounded-2xl skeleton flex items-center justify-center
        ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
        style={{ height }}
      >
        <p className="text-slate-400 text-sm">Loading Odisha District Map…</p>
      </div>
    );
  }

  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 ${className}`}
      style={{ height, minHeight: typeof height === 'number' ? height : 500 }}
    >
      <MapContainer
        key={mapKey}
        center={ODISHA_CENTER}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <GeoJSON
          key={mapKey}
          data={geoJson}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      <Legend darkMode={darkMode} />
    </div>
  );
}
