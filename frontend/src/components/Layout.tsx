import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Settings, CalendarDays, FileText } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/sites', label: 'Sites', icon: Settings },
    { path: '/staff', label: 'Staff List', icon: Users },
    { path: '/meetings', label: 'Meetings', icon: CalendarDays },
    { path: '/contracts', label: 'Service Contracts', icon: FileText },
    { path: '/supply-contracts', label: 'Supply Contracts', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">Kulkoni SA</h1>
          <p className="text-slate-400 text-sm">Power Stations</p>
        </div>
        <ul className="mt-8 space-y-2 px-4">
          {navigationItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <p className="text-gray-600 text-sm">Welcome to Power Station Management System</p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
