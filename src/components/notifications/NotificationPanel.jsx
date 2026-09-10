import { useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Bell, Plus, Edit, Trash2, UserPlus, UserMinus, FolderPlus, X, Send, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

const ICONS = {
  plus: Plus,
  edit: Edit,
  trash: Trash2,
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  'folder-plus': FolderPlus,
  default: Bell,
};

const COLORS = {
  task_added: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  task_updated: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  task_deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  user_added: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  user_deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  dept_added: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  dept_deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotifRead, markAllNotifRead, t } = useApp();
  const ref = useRef(null);

  // Вақт бўйича саралаш
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      /* 
         ТУЗАТИШ: 
         - Мобилда: fixed бўлиб экраннинг икки четидан 1rem (left-4 right-4) жой қолдиради ва ўртада туради.
         - Катта экранда (sm:): absolute бўлиб тугманинг ўнг томонига (right-0) текисланади ва кенглиги 400px бўлади.
      */
      className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.2rem] shadow-2xl z-[999] animate-fade-in overflow-hidden sm:w-[400px]"
    >
      {/* HEADER */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            {t.notifications || "Bildirishnomalar"}
          </h3>
          <span className="text-[10px] bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-bold px-1.5 py-0.2 rounded-md">
             {notifications.filter(n => !n.read).length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllNotifRead} 
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 rounded-lg transition-colors"
              title={t.markAllRead || "Barchasini o'qilgan deb belgilash"}
            >
              <CheckCheck size={16} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X size={16}/>
          </button>
        </div>
      </div>

      {/* TELEGRAM BANNER */}
      <div className="p-3">
        <a 
          href="https://t.me/+RyIHMrYO0wUyMzgy" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/50 text-sky-800 dark:text-sky-300 rounded-xl hover:bg-sky-100/70 transition-all group"
        >
          <div className="bg-sky-500 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
            <Send size={15} />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-900 dark:text-sky-200">Telegram Kanal</p>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium leading-tight">Yangi topshiriqlar va yangiliklar kanali</p>
          </div>
        </a>
      </div>
      
      {/* LIST */}
      <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto custom-scrollbar">
        {sortedNotifications.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
               <Bell size={22} className="opacity-30" />
            </div>
            <p className="text-xs font-semibold">Bildirishnomalar mavjud emas</p>
          </div>
        ) : (
          sortedNotifications.map(notif => {
            const Icon = ICONS[notif.icon] || ICONS.default;
            const colorClass = COLORS[notif.type] || COLORS.default;
            return (
              <button
                key={notif.id}
                onClick={() => markNotifRead(notif.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group ${!notif.read ? 'bg-primary-500/[0.04]' : ''}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${colorClass} mt-0.5`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1">
                    {notif.message}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: uz }) : ''}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      {sortedNotifications.length > 0 && (
        <div className="py-2.5 px-4 bg-slate-50/70 dark:bg-slate-900/60 text-center border-t border-slate-100 dark:border-slate-800">
           <p className="text-[10px] text-slate-400 font-semibold tracking-wider">TaskFlow Bildirishnomalar</p>
        </div>
      )}
    </div>
  );
}