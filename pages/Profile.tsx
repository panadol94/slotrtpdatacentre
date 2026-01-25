import React, { useEffect, useRef } from 'react';
import { User, Settings, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

export const Profile: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  }, []);

  return (
    <div ref={containerRef} className="pt-24 pb-24 px-4 max-w-lg mx-auto min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-200 to-indigo-100 p-1 mb-4">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
             <User size={40} className="text-slate-300" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Guest User</h2>
        <p className="text-sm text-slate-400">ID: 8829103</p>
        <span className="mt-2 px-3 py-1 bg-gold-100 text-gold-600 text-xs font-bold rounded-full border border-gold-200">FREE PLAN</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
        {[
          { icon: Settings, label: "Account Settings" },
          { icon: CreditCard, label: "Subscription" },
          { icon: LogOut, label: "Log Out", danger: true }
        ].map((item, idx) => (
          <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.danger ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                <item.icon size={18} />
              </div>
              <span className={`font-medium ${item.danger ? 'text-red-500' : 'text-slate-700'}`}>{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">Version 2.0.1 (Build 445)</p>
      </div>
    </div>
  );
};