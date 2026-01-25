import React, { useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import gsap from 'gsap';

export const Chat: React.FC = () => {
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
    <div ref={containerRef} className="pt-24 pb-24 px-4 max-w-2xl mx-auto h-screen flex flex-col">
       <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Community Chat</h1>
        <p className="text-slate-500">Live discussion with other active scanners.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 p-4 bg-slate-50/50 space-y-4 overflow-y-auto">
          {/* Mock Messages */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">JD</div>
            <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-700">Has anyone tried the new Fortune Gems scan?</p>
              <span className="text-[10px] text-slate-400 mt-1 block">10:42 AM</span>
            </div>
          </div>

          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold shrink-0">ME</div>
             <div className="bg-primary-600 p-3 rounded-tl-xl rounded-br-xl rounded-bl-xl shadow-md shadow-primary-200">
              <p className="text-sm text-white">Yes! Just got a 98% hit. It's crazy right now.</p>
              <span className="text-[10px] text-primary-200 mt-1 block">10:44 AM</span>
            </div>
          </div>

           <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold shrink-0">AK</div>
            <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-700">Waiting for my scan to finish...</p>
              <span className="text-[10px] text-slate-400 mt-1 block">10:45 AM</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
          <button className="bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};