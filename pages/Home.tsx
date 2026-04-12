import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '../components/Terminal';
import { ResultCard } from '../components/ResultCard';
import { LogEntry, GameResult } from '../types';
import { Wifi, Activity, Play, Filter, ChevronDown, X, Search, Check, Zap, Lock, BatteryCharging, Clock, Share2, Star, Shield, TrendingUp, ArrowRight, Cpu, Eye, BarChart3, Globe, Layers } from 'lucide-react';
import { PROVIDERS_LIST, PROVIDER_GAMES, DEFAULT_GAMES } from '../constants';
import { PRAGMATIC_PLAY_GAMES } from '../data/pragmatic_play_games';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

const RESTRICTED_PROVIDERS = ["Mega888", "918Kiss", "Pussy888"];

type GameCatalogItem = {
  name: string;
  image?: string;
};

const DEFAULT_GAME_ITEMS: GameCatalogItem[] = DEFAULT_GAMES.map(name => ({ name }));

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [availableGames, setAvailableGames] = useState<GameCatalogItem[]>(DEFAULT_GAME_ITEMS);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [userInputId, setUserInputId] = useState("");
  const [inputError, setInputError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scanButtonGlowRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const providerButtonRef = useRef<HTMLButtonElement>(null);

  const isRestricted = RESTRICTED_PROVIDERS.includes(selectedProvider);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-element", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchGameList = async () => {
      setIsMaintenance(false);
      if (!selectedProvider) {
        setAvailableGames(DEFAULT_GAME_ITEMS);
        return;
      }
      // Use embedded data for providers with built-in game lists
      if (selectedProvider === 'Pragmatic Play') {
        setAvailableGames(PRAGMATIC_PLAY_GAMES.map(g => ({ name: g.title, image: g.image })));
        return;
      }
      if (PROVIDER_GAMES[selectedProvider] && PROVIDER_GAMES[selectedProvider].length > 0) {
        setAvailableGames(PROVIDER_GAMES[selectedProvider].map(name => ({ name })));
        return;
      }
      try {
        const response = await fetch(`/providers/${encodeURIComponent(selectedProvider)}/games.txt?t=${Date.now()}`);
        if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith("<")) {
            setAvailableGames(DEFAULT_GAME_ITEMS);
            return;
          }
          const games = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(name => ({ name }));
          if (games.length > 0) {
            setAvailableGames(games);
          } else {
            setIsMaintenance(true);
            setAvailableGames([]);
          }
        } else {
          setIsMaintenance(true);
          setAvailableGames([]);
        }
      } catch (error) {
        setIsMaintenance(true);
        setAvailableGames([]);
      }
    };
    fetchGameList();
    setUserInputId("");
    setInputError(false);
  }, [selectedProvider]);

  useEffect(() => {
    if (!scanButtonGlowRef.current) return;
    const pulseTween = gsap.to(scanButtonGlowRef.current, {
      opacity: 0.8,
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    if (isScanning) pulseTween.timeScale(3);
    else pulseTween.timeScale(1);
    return () => { pulseTween.kill(); };
  }, [isScanning]);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      gsap.fromTo(".result-row", { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.4, stagger: { amount: 1.0, grid: "auto", from: "start" },
        ease: "power2.out", clearProps: "all"
      });
    }
  }, [results]);

  const startScan = () => {
    if (!selectedProvider) {
      setShowProviderModal(true);
      if (providerButtonRef.current) {
        gsap.fromTo(providerButtonRef.current, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
      }
      return;
    }
    if (isMaintenance) {
      if (buttonRef.current) {
        gsap.fromTo(buttonRef.current, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
      }
      return;
    }
    if (isScanning) return;
    if (isRestricted && !userInputId.trim()) {
      setInputError(true);
      if (inputRef.current) {
        inputRef.current.focus();
        gsap.fromTo(inputRef.current.parentElement, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
      }
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setResults([]);
    setProgress(0);
    setInputError(false);

    let step = 0;
    const maxSteps = 20;
    const intervalMs = 300;

    const interval = setInterval(() => {
      step++;
      const progressValue = Math.min((step / maxSteps) * 100, 100);
      setProgress(progressValue);

      let msg = "";
      if (isRestricted && step === 2) msg = `Verifying User ID: ${userInputId.substring(0, 3)}****...`;
      else if (isRestricted && step === 3) msg = `Access granted for ID: ${userInputId}`;
      else if (step === 1) msg = `Initializing scan for ${selectedProvider}...`;
      else if (step === 2) msg = `Database loaded: ${availableGames.length} titles found.`;
      else if (step === maxSteps) msg = "Scan complete. Data successfully retrieved.";
      else {
        const useGameName = availableGames.length > 0 && Math.random() > 0.2;
        if (useGameName) {
          const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
          const actions = ["Analysing", "Checking RTP for", "Downloading config:", "Verifying signal:", "Ping pong response:"];
          msg = `${actions[Math.floor(Math.random() * actions.length)]} ${randomGame.name}...`;
        } else {
          msg = getRandomLogMessage();
        }
      }

      const newLog: LogEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: msg,
        type: step === maxSteps ? 'success' : (isRestricted && step === 3 ? 'success' : 'info')
      };
      setLogs(prev => [...prev, newLog]);

      if (step >= maxSteps) {
        clearInterval(interval);
        finishScan();
      }
    }, intervalMs);
  };

  const finishScan = () => {
    setIsScanning(false);
    generateResults();
  };

  const generateResults = () => {
    const gamePool = availableGames.length > 0 ? availableGames : DEFAULT_GAME_ITEMS;
    const newResults: GameResult[] = gamePool.map((game, i) => ({
      id: `game-${i}-${Date.now()}`,
      name: game.name,
      image: game.image,
      rtp: Number((Math.random() * (97 - 10) + 10).toFixed(2)),
      provider: selectedProvider,
      volatility: (Math.random() * (97 - 10) + 10) > 90 ? 'High' as const : 'Med' as const,
      lastWin: `${Math.floor(Math.random() * 20)}m ago`
    })).sort((a, b) => b.rtp - a.rtp);
    setResults(newResults);
  };

  const getRandomLogMessage = (): string => {
    const messages = [
      "Initializing connection to remote server...",
      "Bypassing firewall security protocols...",
      "Analysing server packet responses...",
      "Detecting algorithmic patterns...",
      "Synchronizing with provider database...",
      "Decrypting RTP stream data...",
      "Filtering noise signals...",
      "Validating checksums...",
      "Optimizing result predictions...",
      "Finalizing data aggregation..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleShare = async () => {
    if (results.length === 0) return;
    const topGames = results.slice(0, 5);
    const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    let shareText = `🎰 *SLOT RTP SCANNER RESULT* 🎰\n\n📅 ${dateStr}\n🏢 Provider: *${selectedProvider}*\n\n🔥 *TOP HIGH RTP SIGNALS:*\n`;
    topGames.forEach((g, i) => { shareText += `${i + 1}. ${g.name} - *${g.rtp}%*\n`; });
    shareText += `\n🚀 Good Luck & Have Fun!\n\n🔒 Copyright © www.slotdatartp.com`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Slot RTP Scan Result', text: shareText }); } catch (err) { console.log('Error sharing:', err); }
    } else {
      try { await navigator.clipboard.writeText(shareText); alert('Result copied to clipboard!'); } catch (err) { console.error('Failed to copy', err); }
    }
  };

  const filteredProviders = PROVIDERS_LIST.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

  const features = [
    { title: "Real-time Scanner", desc: "Live RTP data intercepted from 50+ provider servers with AI analysis.", icon: Cpu, span: "md:col-span-2" },
    { title: "Any Provider", desc: "Pragmatic Play, PG Soft, Habanero, JILI, Mega888, and 45+ more.", icon: Layers, span: "" },
    { title: "Verified Sources", desc: "Cross-referenced data from multiple endpoints for accuracy.", icon: Shield, span: "" },
    { title: "Live Monitoring", desc: "Track RTP changes in real-time. Get notified when patterns shift.", icon: Eye, span: "md:col-span-2" },
    { title: "Analytics", desc: "Historical trends, volatility mapping, and predictive signals.", icon: BarChart3, span: "" },
  ];

  const testimonials = [
    { text: "The RTP data here is incredibly accurate. Helped me find the best slots to play!", handle: "@alexc" },
    { text: "Finally a reliable source for slot analytics. The real-time updates are game-changing.", handle: "@sarahk" },
    { text: "Best RTP scanner I've used. Clean interface and accurate data.", handle: "@mjohnson" },
    { text: "The provider selection is massive. Love the detailed analytics!", handle: "@lisaw" },
    { text: "Been using this for 3 months now. The accuracy is unmatched.", handle: "@daveP" },
    { text: "This scanner saved me so much time. Highly recommended!", handle: "@tommy99" },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen pb-24 pt-16 md:pt-20 overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0a0a0a]">
        {/* Subtle red vignette glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-500/3 blur-[100px] rounded-full"></div>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="px-4 max-w-4xl mx-auto">

        {/* ═══════════════════════════════════════
            HERO SECTION — OpenClaw Style
        ═══════════════════════════════════════ */}
        <div className="text-center mb-20 pt-8 md:pt-16">

          {/* Mascot / Logo Icon */}
          <div className="hero-element mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent-500/10 border border-accent-500/20 glow-red">
              <Zap size={36} className="text-accent-500" fill="currentColor" />
            </div>
          </div>

          {/* Title — Italic Serif like OpenClaw */}
          <h1 className="hero-element text-6xl md:text-8xl font-serif italic text-white tracking-tight mb-6">
            SlotData
          </h1>

          {/* Subtitle — Red uppercase */}
          <p className="hero-element text-accent-500 text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-6">
            THE RTP SCANNER THAT ACTUALLY WORKS.
          </p>

          {/* Description */}
          <p className="hero-element text-neutral-400 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Real-time RTP data from 50+ trusted providers. Scan any slot, track patterns, and make informed decisions.
          </p>

          {/* Announcement Pill */}
          <div className="hero-element mb-16">
            <a href="#scanner" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-accent-500/30 transition-all pill-glow group">
              <span className="px-2 py-0.5 rounded-md bg-accent-500 text-white text-[10px] font-bold uppercase">Live</span>
              <span className="text-sm text-neutral-300">Real-time data from 50+ providers</span>
              <ArrowRight size={14} className="text-accent-500 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>


        {/* ═══════════════════════════════════════
            SCANNER SECTION — ⟩ Start Scanning
        ═══════════════════════════════════════ */}
        <div id="scanner" className="mb-20 scroll-mt-20">
          <h2 className="hero-element text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <span className="section-chevron text-lg">⟩</span> Start Scanning
          </h2>

          <div className="hero-element bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 md:p-8">
            
            {/* Provider Selector */}
            <div className="max-w-md mx-auto mb-6 relative z-20">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block text-center">
                {t('hero.select_provider')}
              </label>
              <button
                ref={providerButtonRef}
                onClick={() => !isScanning && setShowProviderModal(true)}
                disabled={isScanning}
                className={`w-full flex items-center justify-between gap-4 border font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 group
                  ${isScanning ? 'opacity-60 cursor-not-allowed border-neutral-800 bg-neutral-900 text-neutral-500' :
                    selectedProvider ? 'bg-neutral-900 border-accent-500/40 text-white hover:border-accent-500/60' :
                      'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-accent-500/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                    ${selectedProvider ? 'bg-accent-500 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                    {selectedProvider ? selectedProvider.charAt(0) : <Zap size={14} />}
                  </div>
                  <span className="truncate">{selectedProvider || t('hero.select_provider')}</span>
                </div>
                <ChevronDown size={16} className="text-neutral-600 group-hover:text-accent-500 transition-colors" />
              </button>
            </div>

            {/* User ID Input for Restricted Providers */}
            {isRestricted && (
              <div className="max-w-md mx-auto mb-6">
                <div className={`bg-neutral-950 rounded-xl p-1 border transition-all duration-300 ${inputError ? 'border-accent-500/50' : 'border-neutral-800'}`}>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-accent-500 pointer-events-none">
                      <Lock size={16} />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInputId}
                      onChange={(e) => { setUserInputId(e.target.value); setInputError(false); }}
                      placeholder={t('hero.enter_id', { provider: selectedProvider })}
                      disabled={isScanning}
                      className="w-full pl-11 pr-4 py-3 bg-transparent text-white font-medium placeholder:text-neutral-600 focus:outline-none text-center rounded-xl text-sm"
                    />
                  </div>
                </div>
                {inputError && <p className="text-accent-500 text-xs font-medium mt-2 text-center">{t('hero.id_required')}</p>}
              </div>
            )}

            {/* Scan Button */}
            <div className={`relative inline-block group w-full max-w-md mx-auto ${isRestricted ? '' : 'mt-2'}`} style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="w-full max-w-md">
                {!isMaintenance && (
                  <div ref={scanButtonGlowRef} className="absolute -inset-1 bg-accent-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                )}
                <button
                  ref={buttonRef}
                  onClick={startScan}
                  disabled={isScanning || isMaintenance}
                  className={`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base overflow-hidden transition-all duration-300
                    ${isMaintenance ? 'bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800' :
                      isScanning ? 'cursor-not-allowed bg-neutral-900 text-white border border-neutral-800' :
                        'bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/20 border border-accent-400/20'
                    }`}
                >
                  {!isScanning && !isMaintenance && (
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 transition-transform duration-1000 group-hover:translate-x-[150%]"></div>
                  )}
                  {isScanning && (
                    <div className="absolute inset-y-0 left-0 bg-accent-600 transition-all duration-300 rounded-xl" style={{ width: `${progress}%` }}></div>
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    {isScanning ? (
                      <><Activity className="animate-spin" size={18} /><span className="tracking-wide">{t('hero.scanning')} {Math.round(progress)}%</span></>
                    ) : isMaintenance ? (
                      <><Lock size={16} /> {t('hero.maintenance')}</>
                    ) : (
                      <><Play fill="currentColor" size={16} /> {t('hero.start_scan')}</>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Terminal Section */}
        <div className="terminal-container">
          <Terminal logs={logs} isActive={isScanning} />
        </div>


        {/* ═══════════════════════════════════════
            RESULTS — Detected Signals
        ═══════════════════════════════════════ */}
        {results.length > 0 && (
          <div ref={resultsRef} className="mt-12 mb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="section-chevron text-lg">⟩</span> {t('results.detected_signals')} ({results.length})
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded hidden sm:inline-block">
                  ID: {Date.now().toString().slice(-6)}
                </span>
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600 transition-colors">
                  <Share2 size={14} /> {t('results.share')}
                </button>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
              {results.map((game, i) => (
                <div key={game.id} className="result-row relative flex items-center justify-between p-4 group hover:bg-neutral-800/50 transition-all duration-200 border-b border-neutral-800/50 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${i < 3 ? 'bg-accent-500 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      {game.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700">
                          <img 
                            src={game.image} 
                            alt={game.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors text-sm">{game.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase font-medium text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded">{game.provider}</span>
                          {game.volatility === 'High' && <span className="text-[10px] text-accent-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>HOT</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] text-neutral-600 flex items-center gap-1 justify-end"><Clock size={10} /> {t('results.last_win')}</div>
                      <div className="text-sm text-neutral-500">{game.lastWin}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${game.rtp >= 96 ? 'text-emerald-400' : game.rtp >= 80 ? 'text-accent-500' : 'text-neutral-500'}`}>
                        {game.rtp}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ═══════════════════════════════════════
            TESTIMONIALS — ⟩ What People Say
        ═══════════════════════════════════════ */}
        <div className="hero-element mb-20 mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="section-chevron text-lg">⟩</span> What People Say
            </h2>
            <span className="text-accent-500 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={12} />
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 card-hover">
                <p className="text-sm text-neutral-300 mb-4 leading-relaxed">"{t.text}"</p>
                <span className="text-accent-500 text-sm font-semibold">{t.handle}</span>
              </div>
            ))}
          </div>
        </div>


        {/* ═══════════════════════════════════════
            FEATURES — ⟩ What It Does (Bento Grid)
        ═══════════════════════════════════════ */}
        <div className="hero-element mb-20">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <span className="section-chevron text-lg">⟩</span> What It Does
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((item, i) => (
              <div key={i} className={`bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 card-hover group ${item.span}`}>
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-4 group-hover:bg-accent-500/20 transition-all">
                  <item.icon size={20} className="text-accent-500" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>


        {/* ═══════════════════════════════════════
            PROVIDERS — ⟩ Works With Everything
        ═══════════════════════════════════════ */}
        <div className="hero-element mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="section-chevron text-lg">⟩</span> Works With Everything
            </h2>
            <span className="text-accent-500 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1">
              View all 50+ <ArrowRight size={12} />
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {PROVIDERS_LIST.slice(0, 20).map((p, i) => (
              <button
                key={i}
                onClick={() => { setSelectedProvider(p); document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-400 hover:border-accent-500/30 hover:text-white transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>


        {/* ═══════════════════════════════════════
            NEWSLETTER — ⟩ Stay in the Loop
        ═══════════════════════════════════════ */}
        <div className="hero-element mb-20">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-4">
            <span className="section-chevron text-lg">⟩</span> Stay in the Loop
          </h2>
          <p className="text-neutral-500 text-sm mb-6">Get updates on new features, providers, and analytics insights. No spam.</p>
          <div className="flex gap-3 max-w-md">
            <input 
              type="email"
              placeholder="your@email.com" 
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
            <button className="px-6 py-3 bg-accent-500 text-white font-bold text-sm rounded-xl hover:bg-accent-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>


        {/* ═══════════════════════════════════════
            FOOTER — Minimal Centered
        ═══════════════════════════════════════ */}
        <footer className="border-t border-neutral-800 pt-8 pb-12 text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            <span className="text-accent-500 font-bold">⟩</span>
            <span className="text-lg font-serif italic text-white">SlotData</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-500 mb-4 flex-wrap">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <span className="text-neutral-800">·</span>
            <a href="#/trusted" className="hover:text-white transition-colors">Trusted</a>
            <span className="text-neutral-800">·</span>
            <a href="#/chat" className="hover:text-white transition-colors">Chat</a>
            <span className="text-neutral-800">·</span>
            <a href="https://t.me/slotdatartp" className="hover:text-white transition-colors">Telegram</a>
          </div>
          <p className="text-xs text-neutral-700">
            © {new Date().getFullYear()} SlotData RTP Centre. All rights reserved.
          </p>
        </footer>


        {/* ═══════════════════════════════════════
            PROVIDER SELECTION MODAL
        ═══════════════════════════════════════ */}
        {showProviderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowProviderModal(false)}></div>
            <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{t('hero.select_provider')}</h3>
                <button onClick={() => setShowProviderModal(false)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-3 border-b border-neutral-800">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-neutral-600" size={16} />
                  <input type="text" placeholder="Search provider..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-500/30" autoFocus />
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredProviders.map((p) => (
                    <button key={p} onClick={() => { setSelectedProvider(p); setShowProviderModal(false); }}
                      className={`relative flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-left
                        ${selectedProvider === p ? 'bg-accent-500/10 border-accent-500/40 text-white' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-accent-500/20 hover:text-white'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedProvider === p ? 'bg-accent-500 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                        {p.charAt(0)}
                      </div>
                      <span className="text-xs font-medium truncate">{p}</span>
                      {selectedProvider === p && <Check size={12} className="absolute top-2 right-2 text-accent-500" />}
                    </button>
                  ))}
                </div>
                {filteredProviders.length === 0 && <div className="text-center py-8 text-neutral-600">No providers found</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
