import React from 'react';
import { GameResult } from '../types';
import { TrendingUp, Clock, Flame } from 'lucide-react';

interface ResultCardProps {
  game: GameResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ game }) => {
  const getRtpColor = (rtp: number) => {
    if (rtp >= 96) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' };
    if (rtp >= 80) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' };
    return { text: 'text-neutral-500', bg: 'bg-neutral-800', border: 'border-neutral-700', glow: '' };
  };

  const isHighRtp = game.rtp >= 96;
  const rtpStyle = getRtpColor(game.rtp);

  return (
    <div 
      className="group relative bg-[#111111] rounded-2xl p-4 border border-neutral-800 hover:border-neutral-700 shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Neon glow for high RTP */}
      {isHighRtp && (
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(16,185,129,0.05)] group-hover:shadow-[inset_0_0_40px_rgba(16,185,129,0.08)] transition-shadow duration-500 pointer-events-none"></div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-600 uppercase border border-neutral-800 px-2 py-0.5 rounded-full bg-neutral-900">
            {game.provider}
          </span>
          {isHighRtp && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Flame size={10} /> HOT
            </span>
          )}
        </div>

        {game.image && (
          <div className="mb-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 aspect-square">
            <img
              src={game.image}
              alt={game.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        <h3 className="font-semibold text-white text-sm leading-tight mb-3 group-hover:text-accent-400 transition-colors truncate">
          {game.name}
        </h3>

        <div className="flex items-end justify-between border-t border-neutral-800 pt-3">
          <div>
            <div className="text-[10px] text-neutral-600 mb-1 font-mono uppercase tracking-wider">RTP</div>
            <div className={`text-2xl font-black tracking-tight ${rtpStyle.text}`}>
              {game.rtp}<span className="text-sm">%</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] text-neutral-600 mb-1 font-mono uppercase tracking-wider flex items-center gap-1 justify-end">
              <Clock size={10} /> Last Win
            </div>
            <div className="text-xs font-semibold text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md font-mono">
              {game.lastWin}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isHighRtp ? 'bg-emerald-500' : game.rtp >= 80 ? 'bg-amber-500' : 'bg-neutral-800'} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );
};