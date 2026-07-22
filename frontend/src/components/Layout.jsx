import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../context/AppContext';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/live': 'Live Monitoring',
  '/analysis': 'Heat Index Analysis',
  '/map': 'District Map',
  '/forecast': 'Weather Forecast',
  '/historical': 'Historical Analysis',
  '/alerts': 'Heat Alerts',
  '/reports': 'Reports & Export',
  '/settings': 'Settings',
};

export default function Layout() {
  const { sidebarCollapsed, darkMode } = useApp();
  const { pathname } = useLocation();
  const sidebarW = sidebarCollapsed ? 72 : 260;
  const title = PAGE_TITLES[pathname] || 'Odisha Heat Index Monitoring';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-[#F7F9FC]'}`}>
      <Sidebar />
      <Header title={title} />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
