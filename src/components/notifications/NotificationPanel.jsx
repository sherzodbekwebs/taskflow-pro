import { useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Bell, CheckCheck, Plus, Edit, Trash2, UserPlus, UserMinus, FolderPlus, X } from 'lucide-react';
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

  // Ma'lumotlarni vaqt bo'yicha yana bir bor tekshirib saralaymiz (Eng yangisi tepada)
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
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] shadow-2xl z-50 animate-fade-in overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">{t.notifications}</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button onClick={markAllNotifRead} className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase">
              {t.markAllRead}
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"><X size={14}/></button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {sortedNotifications.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <Bell size={40} className="mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-tighter">Bildirishnomalar yo'q</p>
          </div>
        ) : (
          sortedNotifications.map(notif => {
            const Icon = ICONS[notif.icon] || ICONS.default;
            const colorClass = COLORS[notif.type] || COLORS.default;
            return (
              <button
                key={notif.id}
                onClick={() => markNotifRead(notif.id)}
                className={`w-full flex items-start gap-3 px-4 py-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left ${!notif.read ? 'bg-primary-500/5' : ''}`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${colorClass} shadow-sm`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-tight mb-1 ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-2">{notif.message}</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: uz }) : ''}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2 shadow-[0_0_8px_rgba(76,110,245,0.6)]" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}