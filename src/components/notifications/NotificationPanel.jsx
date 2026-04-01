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
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            {t.notifications}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
             {notifications.filter(n => !n.read).length} та янги
          </p>
        </div>
        <div className="flex items-center gap-1">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllNotifRead} 
              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 rounded-lg transition-colors"
              title={t.markAllRead}
            >
              <CheckCheck size={18} />
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-lg">
            <X size={18}/>
          </button>
        </div>
      </div>

      {/* TELEGRAM BANNER */}
      <div className="px-4 py-3">
        <a 
          href="https://t.me/+RyIHMrYO0wUyMzgy" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all"
        >
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Send size={18} className="rotate-12" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">Telegram Гуруҳ</p>
            <p className="text-[10px] opacity-90 leading-tight">Янги хабарларни гуруҳда кузатинг</p>
          </div>
        </a>
      </div>
      
      {/* LIST */}
      <div className="max-h-[60vh] sm:max-h-[450px] overflow-y-auto custom-scrollbar">
        {sortedNotifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-4">
               <Bell size={32} className="opacity-20" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest">Билдиришномалар йўқ</p>
          </div>
        ) : (
          sortedNotifications.map(notif => {
            const Icon = ICONS[notif.icon] || ICONS.default;
            const colorClass = COLORS[notif.type] || COLORS.default;
            return (
              <button
                key={notif.id}
                onClick={() => markNotifRead(notif.id)}
                className={`w-full flex items-start gap-4 px-5 py-5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-all text-left group ${!notif.read ? 'bg-primary-500/[0.03]' : ''}`}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-[13px] font-bold leading-tight truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(76,110,245,0.6)]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed mb-2 tracking-tight">
                    {notif.message}
                  </p>
                  <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter">
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
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 text-center border-t border-slate-100 dark:border-slate-700">
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[2px]">TaskFlow Notifications</p>
        </div>
      )}
    </div>
  );
}