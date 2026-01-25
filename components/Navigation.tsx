import React from 'react';
import { Home, ShieldCheck, MessageCircle, User, Zap, Grid3X3 } from 'lucide-react';
import { NavTab } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current path to determine active tab
  const currentPath = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  const navItems: { id: NavTab; label: string; icon: React.FC<any>; path: string }[] = [
    { id: 'home', label: 'Scanner', icon: Home, path: '/' },
    { id: 'trusted', label: 'Trusted', icon: Grid3X3, path: '/trusted' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm hidden md:block">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-tr from-primary-600 to-primary-400 text-white p-1.5 rounded-lg shadow-lg shadow-primary-200">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              Slot RTP Data Centre
            </span>
          </div>

          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  currentPath === item.id
                    ? 'text-primary-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${
                currentPath === item.id
                  ? 'text-primary-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={currentPath === item.id ? 2.5 : 2}
                className={`transition-transform duration-200 ${currentPath === item.id ? '-translate-y-0.5' : ''}`}
              />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Top Bar (Logo only) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 h-14 flex items-center justify-center shadow-sm">
         <div className="flex items-center gap-2">
            <div className="text-primary-600">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              Slot RTP Data Centre
            </span>
          </div>
      </div>
    </>
  );
};