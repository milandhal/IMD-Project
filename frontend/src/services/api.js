import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const fetchDashboard = () => api.get('/dashboard').then(r => r.data);
export const fetchLiveWeather = () => api.get('/live-weather').then(r => r.data);
export const fetchAlerts = () => api.get('/alerts').then(r => r.data);
export const fetchForecast = (district = '') =>
  api.get('/forecast', { params: district ? { district } : {} }).then(r => r.data);
export const fetchHistorical = (district = '') =>
  api.get('/historical', { params: district ? { district } : {} }).then(r => r.data);
export const fetchMlMetrics = () => api.get('/ml-metrics').then(r => r.data);
export const triggerRefresh = () => api.get('/refresh').then(r => r.data);

export default api;
