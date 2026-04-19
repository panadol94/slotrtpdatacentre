import React, { useState, useEffect } from 'react';
import { Home, ShieldCheck, MessageCircle, User, Zap, Download, Globe } from 'lucide-react';
import { NavTab } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'my' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentPath = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems: { id: NavTab; label: string; icon: React.FC<any>; path: string }[] = [
    { id: 'home', label: t('nav.home'), icon: Home, path: '/' },
    { id: 'trusted', label: t('nav.trusted'), icon: ShieldCheck, path: '/trusted' },
    { id: 'chat', label: t('nav.chat'), icon: MessageCircle, path: '/chat' },
    { id: 'profile', label: t('nav.profile'), icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 hidden md:block">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-neutral-800/50">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <span className="text-accent-500 text-xl">⟩</span>
            <span className="text-lg font-serif italic text-white group-hover:text-accent-500 transition-colors">
              SlotData
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors duration-200 px-4 py-2 rounded-lg ${currentPath === item.id
                  ? 'text-accent-500'
                  : 'text-neutral-500 hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            ))}

            <div className="h-5 w-px bg-neutral-800 mx-3"></div>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-all"
            >
              <Globe size={12} />
              {i18n.language === 'en' ? 'EN' : 'MY'}
            </button>

            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 text-white hover:bg-accent-600 rounded-lg text-xs font-bold transition-colors ml-2"
              >
                <Download size={12} />
                {t('nav.install')}
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation — with center scan FAB */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
        {/* Glow behind FAB */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-accent-500/20 blur-2xl rounded-full pointer-events-none"></div>
        
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-neutral-800/50 pb-safe">
          <div className="flex justify-around items-center h-16 px-2 relative">
            {/* Left nav items */}
            {navItems.slice(0, 2).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${currentPath === item.id
                  ? 'text-accent-500'
                  : 'text-neutral-600 hover:text-neutral-400'
                  }`}
              >
                <item.icon size={20} strokeWidth={currentPath === item.id ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}

            {/* Center Scan FAB */}
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="relative flex flex-col items-center justify-center -mt-6 w-14 h-14 rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/30 hover:bg-accent-600 active:scale-95 transition-all duration-200 border-2 border-accent-400/30"
            >
              <Zap size={22} fill="currentColor" />
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full bg-accent-500/40 animate-ping opacity-20"></div>
            </button>

            {/* Right nav items */}
            {navItems.slice(2).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${currentPath === item.id
                  ? 'text-accent-500'
                  : 'text-neutral-600 hover:text-neutral-400'
                  }`}
              >
                <item.icon size={20} strokeWidth={currentPath === item.id ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-neutral-800/50 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2" onClick={() => navigate('/')}>
          <span className="text-accent-500 font-bold">⟩</span>
          <span className="text-sm font-serif italic text-white">SlotData</span>
        </div>

        <div className="flex items-center gap-2">
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2 py-1.5 bg-accent-500 text-white rounded-lg text-[10px] font-bold"
            >
              <Download size={12} />
              APP
            </button>
          )}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-400"
          >
            <Globe size={12} />
            {i18n.language === 'en' ? 'EN' : 'MY'}
          </button>
        </div>
      </div>
    </>
  );
};