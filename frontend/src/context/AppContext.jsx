import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchDashboard, fetchLiveWeather, fetchAlerts, fetchForecast, fetchHistorical, fetchMlMetrics, triggerRefresh } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Data state
  const [dashboard, setDashboard] = useState(null);
  const [liveWeather, setLiveWeather] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [historical, setHistorical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mlAccuracy, setMlAccuracy] = useState({ temp: 0.959, hi: 0.910 });

  const intervalRef = useRef(null);

  const loadAllData = useCallback(async () => {
    try {
      const [dashData, weatherData, alertData, forecastData, histData, mlData] = await Promise.all([
        fetchDashboard(),
        fetchLiveWeather(),
        fetchAlerts(),
        fetchForecast(),
        fetchHistorical(),
        fetchMlMetrics().catch(() => null),
      ]);
      
      if (dashData.success) setDashboard(dashData.data);
      if (weatherData.success) setLiveWeather(weatherData.data);
      if (alertData.success) setAlerts(alertData.data);
      if (forecastData.success) setForecast(forecastData.data);
      if (histData.success) setHistorical(histData.data);
      if (mlData?.success) {
        setMlAccuracy({
          temp: mlData.data.temp_r2 ?? 0.959,
          hi: mlData.data.hi_r2 ?? 0.910,
        });
      }
      
      setLastUpdated(new Date());
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await triggerRefresh();
      await loadAllData();
    } catch {
      setApiStatus('offline');
      setLoading(false);
    }
  }, [loadAllData]);

  // Initial load
  useEffect(() => { loadAllData(); }, [loadAllData]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    intervalRef.current = setInterval(loadAllData, 10 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [loadAllData]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      sidebarCollapsed, setSidebarCollapsed,
      selectedDistrict, setSelectedDistrict,
      dashboard, liveWeather, alerts, forecast, historical,
      loading, apiStatus, lastUpdated, mlAccuracy,
      handleRefresh
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
