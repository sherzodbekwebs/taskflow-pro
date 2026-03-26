import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { LogIn, Eye, EyeOff, CheckSquare, Loader2, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';

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

    // Kirish jarayoni kutish vaqti
    await new Promise(r => setTimeout(r, 800));

    const foundUser = users.find(u => u.username === username);

    if (!foundUser) {
      setError(t.errorUserNotFound);
    } else if (foundUser.password !== password) {
      setError(t.errorWrongPassword);
    } else {
      const user = await login(username, password);
      if (!user) {
        setError(t.errorAuthFailed);
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-[#e9eef2] p-[30px] flex items-center justify-center font-sans overflow-hidden box-border">

      {/* Tilni tanlash dropdown */}
      <div className="absolute top-14 right-16 z-20">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{ borderRadius: "8px" }}
            className="flex items-center gap-3 px-4 py-2.5 bg-white shadow-sm hover:shadow-md text-slate-700 text-sm font-bold transition-all border border-slate-100"
          >
            {language === 'uz' ? (
              <>
                <img src="https://flagcdn.com/w40/uz.png" alt="UZ" className="w-5 h-3.5 object-cover rounded-sm" />
                <span>O‘zbekcha</span>
              </>
            ) : (
              <>
                <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="w-5 h-3.5 object-cover rounded-sm" />
                <span>Русский</span>
              </>
            )}
            <ChevronDown size={16} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => { changeLanguage('uz'); setShowLangMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 ${language === 'uz' ? 'text-primary-600 bg-primary-50/50' : 'text-slate-600'}`}
              >
                <img src="https://flagcdn.com/w40/uz.png" alt="UZ" className="w-5 h-3.5 object-cover rounded-sm" />
                O‘zbekcha
              </button>
              <button
                onClick={() => { changeLanguage('ru'); setShowLangMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 ${language === 'ru' ? 'text-primary-600 bg-primary-50/50' : 'text-slate-600'}`}
              >
                <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="w-5 h-3.5 object-cover rounded-sm" />
                Русский
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Asosiy Card */}
      <div className="bg-white w-full h-full rounded-[0.7rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex overflow-hidden border border-white">

        {/* CHAP TOMON: Kirish qismi */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{t.loginTitle}</h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {t.loginSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-100 text-slate-800 placeholder-slate-400 transition-all outline-none font-medium"
                  placeholder={t.usernamePlaceholder}
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-100 text-slate-800 placeholder-slate-400 transition-all outline-none font-medium pr-14"
                  placeholder={t.passwordPlaceholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <button type="button" className="text-xs font-semibold text-slate-400 hover:text-primary-600 transition-colors">
                  {t.recoveryPassword}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-xs p-4 rounded-2xl border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#8e6b6d] hover:bg-[#7a5a5c] text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-[#8e6b6d33] disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  t.loginBtn
                )}
              </button>
            </form>
          </div>
        </div>

        {/* O'NG TOMON: Vizual qism */}
        <div className="hidden md:block w-1/2 p-4">
          <div className="h-full w-full rounded-[0.7rem] relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

            <div className="absolute bottom-16 left-12 right-12 text-white">
              <h2 className="text-2xl font-bold leading-tight mb-4 drop-shadow-lg italic">
                {t.imageOverlayText}
              </h2>

              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-sm">
                  <ArrowLeft size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-sm">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}