import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  isActive: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, isActive }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Log</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`}></div>
        </div>
      </div>
      
      <div className="h-48 overflow-y-auto p-4 font-mono text-xs md:text-sm bg-slate-50/50 scrollbar-hide">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-60">
            <p>Ready to initialize...</p>
            <p>Waiting for user command.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-slate-400 shrink-0">[{log.timestamp}]</span>
                <span className={`
                  ${log.type === 'success' ? 'text-green-600 font-medium' : ''}
                  ${log.type === 'error' ? 'text-red-500 font-medium' : ''}
                  ${log.type === 'warning' ? 'text-gold-600' : ''}
                  ${log.type === 'info' ? 'text-slate-600' : ''}
                `}>
                  {log.type === 'success' && '✓ '}
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};