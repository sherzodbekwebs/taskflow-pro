import { useState, useEffect } from 'react'; // useEffect qo'shildi
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import NotificationPanel from '../notifications/NotificationPanel';
import {
  LayoutDashboard, CheckSquare, Users, BarChart3, Settings,
  Bell, LogOut, Menu, X, Sun, Moon, Globe, Loader2, CheckCircle2, Clock, Wallet,
  CalendarDays, PhoneCall
} from 'lucide-react';

export default function Layout() {
  const {
    currentUser, logout, t, darkMode, toggleDarkMode,
    language, changeLanguage, unreadCount, isActionLoading, toast
  } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // --- SOAT VA SANA LOGIKASI ---
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = () => {
    const dateStr = time.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const timeStr = time.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    return `${dateStr} | ${timeStr}`;
  };
  // -----------------------------

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.dashboard, exact: true },
    { to: '/tasks', icon: CheckSquare, label: t.tasks },
    { to: '/calendar', icon: CalendarDays, label: t.calendar || (language === 'uz' ? "Taqvim" : "Календарь") },
    { to: '/statistics', icon: BarChart3, label: t.statistics },
    { to: '/kpi', icon: Wallet, label: "KPI" },
    // { to: '/call-center', icon: PhoneCall, label: language === 'uz' ? "Koll-markaz" : "Колл-центр" },
    { to: '/users', icon: Users, label: t.users },
    { to: '/settings', icon: Settings, label: t.settings },
  ];

  const NavItem = ({ to, icon: IconComponent, label, exact }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${isActive
          ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <IconComponent
            size={18}
            className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}
          />
          <span className="truncate">{label}</span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />
          )}
        </>
      )}
    </NavLink>
  );

  const initials = (currentUser?.fullName || currentUser?.fullname || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-100/70 dark:bg-slate-950 overflow-hidden relative">

      {/* 1. SUCCESS TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-in duration-300">
          <div className="bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 dark:border-slate-200 backdrop-blur-md">
            <CheckCircle2 size={18} className="text-emerald-400 dark:text-emerald-600" />
            <span className="text-sm font-semibold tracking-tight">{toast}</span>
          </div>
        </div>
      )}

      {/* 2. GLOBAL ACTION LOADING OVERLAY */}
      {isActionLoading && (
        <div className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-xs z-[100] flex items-center justify-center transition-all">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border border-slate-200/80 dark:border-slate-800 animate-fade-in">
            <Loader2 className="w-9 h-9 text-primary-600 animate-spin" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
              {language === 'uz' ? "Amal bajarilmoqda..." : "Выполняется действие..."}
            </p>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[45] lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20 text-white">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight block leading-tight">TaskFlow</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enterprise Work</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all group text-left"
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {currentUser?.fullName || currentUser?.fullname}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  {currentUser?.role === 'boss' ? t.boss : t.worker}
                </span>
              </div>
            </div>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0 z-40 relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            <Clock size={14} className="text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatDateTime()}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language switch */}
            <button
              onClick={() => changeLanguage(language === 'uz' ? 'ru' : 'uz')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700"
            >
              <Globe size={14} className="text-primary-600 dark:text-primary-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* User pill */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                {(currentUser?.fullName || currentUser?.fullname)?.split(' ')[0]}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title={t.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-100/70 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}