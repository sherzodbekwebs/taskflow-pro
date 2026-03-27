import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import NotificationPanel from '../notifications/NotificationPanel';
import {
  LayoutDashboard, CheckSquare, Users, BarChart3, Settings,
  Bell, LogOut, Menu, X, Sun, Moon, Globe, Loader2, CheckCircle2
} from 'lucide-react';

export default function Layout() {
  const { 
    currentUser, logout, t, darkMode, toggleDarkMode, 
    language, changeLanguage, unreadCount, isActionLoading, toast 
  } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.dashboard, exact: true },
    { to: '/tasks', icon: CheckSquare, label: t.tasks },
    { to: '/users', icon: Users, label: t.users },
    { to: '/statistics', icon: BarChart3, label: t.statistics },
    { to: '/settings', icon: Settings, label: t.settings },
  ];

  const NavItem = ({ to, icon: Icon, label, exact }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
          isActive
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );

  const initials = (currentUser?.fullName || currentUser?.fullname || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      
      {/* 1. SUCCESS TOAST NOTIFICATION (ENG TEPADA) */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 dark:border-slate-200">
            <CheckCircle2 size={18} className="text-green-400 dark:text-green-600" />
            <span className="text-sm font-bold tracking-tight">{toast}</span>
          </div>
        </div>
      )}

      {/* 2. GLOBAL ACTION LOADING OVERLAY */}
      {isActionLoading && (
        <div className="fixed inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px] z-[100] flex items-center justify-center transition-all">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.2em]">Amal bajarilmoqda</p>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - z-index ko'tarildi */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <CheckSquare size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap">Task Flow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser?.fullName || currentUser?.fullname}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">{currentUser?.role === 'boss' ? t.boss : t.worker}</p>
            </div>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex-shrink-0 z-40 relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mr-2"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => changeLanguage(language === 'uz' ? 'ru' : 'uz')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Globe size={16} /> {language.toUpperCase()}
            </button>

            <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300">
                {(currentUser?.fullName || currentUser?.fullname)?.split(' ')[0]}
              </span>
            </button>

            <button onClick={handleLogout} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors" title={t.logout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#e9eef2] dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}