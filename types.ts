export interface GameResult {
  id: string;
  name: string;
  rtp: number;
  provider: string;
  volatility: 'High' | 'Med' | 'Low';
  lastWin: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type NavTab = 'home' | 'trusted' | 'chat' | 'profile';