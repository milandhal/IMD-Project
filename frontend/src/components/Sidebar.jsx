import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, BarChart2, Map, TrendingUp,
  History, Bell, FileText, Settings, ChevronLeft, ChevronRight,
  Thermometer
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { path: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/live',        icon: Activity,        label: 'Live Monitoring' },
  { path: '/analysis',    icon: BarChart2,        label: 'Heat Index Analysis' },
  { path: '/map',         icon: Map,             label: 'District Map' },
  { path: '/forecast',    icon: TrendingUp,       label: 'Forecast' },
  { path: '/historical',  icon: History,          label: 'Historical Analysis' },
  { path: '/alerts',      icon: Bell,            label: 'Alerts' },
  { path: '/reports',     icon: FileText,         label: 'Reports' },
  { path: '/settings',    icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, alerts } = useApp();
  const alertCount = alerts?.length || 0;

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-30 flex flex-col overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #003f6e 0%, #005A9C 60%, #0070ba 100%)' }}
    >
      {/* Logo Area */}
      <div className="flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Thermometer size={20} className="text-orange-300" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Odisha HIM</p>
                <p className="text-blue-200 text-xs whitespace-nowrap">Heat Index Monitor</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isAlerts = path === '/alerts';
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                  title={sidebarCollapsed ? label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium whitespace-nowrap flex-1"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Alert badge */}
                  {isAlerts && alertCount > 0 && (
                    <span className={`${sidebarCollapsed ? 'absolute top-0.5 right-0.5 text-[9px] min-w-[16px] h-4' : 'text-xs min-w-[20px] h-5'} bg-red-500 text-white rounded-full flex items-center justify-center font-bold px-1`}>
                      {alertCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs"
                >
                  Collapse
                </motion.span>
              </AnimatePresence>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
