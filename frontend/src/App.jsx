import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import HeatIndexAnalysis from './pages/HeatIndexAnalysis';
import DistrictMap from './pages/DistrictMap';
import Forecast from './pages/Forecast';
import Historical from './pages/Historical';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="analysis" element={<HeatIndexAnalysis />} />
            <Route path="map" element={<DistrictMap />} />
            <Route path="forecast" element={<Forecast />} />
            <Route path="historical" element={<Historical />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
