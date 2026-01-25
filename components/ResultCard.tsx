import React from 'react';
import { GameResult } from '../types';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';

interface ResultCardProps {
  game: GameResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ game }) => {
  const isHighRtp = game.rtp >= 96;

  return (
    <div 
      className="group relative bg-white rounded-2xl p-4 border border-slate-100 shadow-md hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Background Gradient Decorative */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${isHighRtp ? 'from-green-50 to-transparent' : 'from-gold-50 to-transparent'} rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase border border-slate-100 px-2 py-0.5 rounded-full bg-slate-50">
              {game.provider}
            </span>
            {isHighRtp && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full shadow-sm shadow-green-200">
                    <TrendingUp size={10} /> HOT
                </span>
            )}
        </div>

        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4 group-hover:text-primary-600 transition-colors">
            {game.name}
        </h3>

        <div className="flex items-end justify-between border-t border-slate-100 pt-3 mt-2">
            <div>
                <div className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                    <BarChart3 size={12} /> Probability
                </div>
                <div className={`text-2xl font-black tracking-tight ${isHighRtp ? 'text-green-600' : 'text-gold-500'}`}>
                    {game.rtp}%
                </div>
            </div>
            
            <div className="text-right">
                 <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 justify-end">
                    <Clock size={10} /> Last Win
                </div>
                <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {game.lastWin}
                </div>
            </div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${isHighRtp ? 'bg-green-500' : 'bg-gold-400'} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );
};