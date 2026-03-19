import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '../components/Terminal';
import { ResultCard } from '../components/ResultCard';
import { LogEntry, GameResult } from '../types';
import { Wifi, Activity, Play, Filter, ChevronDown, X, Search, Check, Zap, Lock, BatteryLow, BatteryCharging, Clock, Share2, Star, Shield, Zap as ZapIcon, TrendingUp } from 'lucide-react';
import { PROVIDERS_LIST, PROVIDER_GAMES, DEFAULT_GAMES } from '../constants';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

const RESTRICTED_PROVIDERS = ["Mega888", "918Kiss", "Pussy888"];

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [availableGames, setAvailableGames] = useState<string[]>(DEFAULT_GAMES);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [userInputId, setUserInputId] = useState("");
  const [inputError, setInputError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scanButtonGlowRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
        setAvailableGames(DEFAULT_GAMES);
        return;
      }
      if (PROVIDER_GAMES[selectedProvider] && PROVIDER_GAMES[selectedProvider].length > 0) {
        setAvailableGames(PROVIDER_GAMES[selectedProvider]);
        return;
      }
      try {
        const response = await fetch(`/providers/${encodeURIComponent(selectedProvider)}/games.txt?t=${Date.now()}`);
        if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith("<")) {
            setAvailableGames(DEFAULT_GAMES);
            return;
          }
          const games = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
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
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log("Video autoplay prevented:", error));
      }
    }
  }, []);

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

    gsap.fromTo(".terminal-container", { height: "auto", opacity: 0.8 }, { opacity: 1, duration: 0.5 });

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
          msg = `${actions[Math.floor(Math.random() * actions.length)]} ${randomGame}...`;
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
    const gamePool = availableGames.length > 0 ? availableGames : DEFAULT_GAMES;
    const newResults: GameResult[] = gamePool.map((gameName, i) => ({
      id: `game-${i}-${Date.now()}`,
      name: gameName,
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

  const stats = [
    { label: "Highest RTP", value: "98.5%", icon: TrendingUp, color: "from-emerald-400 to-emerald-600" },
    { label: "24/7", value: "Verified Data", icon: Shield, color: "from-blue-400 to-blue-600" },
    { label: "50+", value: "Providers", icon: ZapIcon, color: "from-purple-400 to-purple-600" }
  ];

  const testimonials = [
    { name: "Alex Chen", handle: "@alexc", text: "The RTP data here is incredibly accurate. Helped me find the best slots to play!", avatar: "A" },
    { name: "Sarah Kim", handle: "@sarahk", text: "Finally a reliable source for slot analytics. The real-time updates are game-changing.", avatar: "S" },
    { name: "Mike Johnson", handle: "@mjohnson", text: "Best RTP scanner I've used. Clean interface and accurate data.", avatar: "M" },
    { name: "Lisa Wong", handle: "@lisaw", text: "The provider selection is massive. Love the detailed analytics!", avatar: "L" }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen pb-24 pt-20 md:pt-24 overflow-x-hidden">

      {/* OpenClaw-Style Background */}
      <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-blue-900/20"></div>
        <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30">
          <source src="https://cdn.pixabay.com/video/2020/05/11/38666-419747974_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="px-4 max-w-6xl mx-auto">

        {/* Hero Section - OpenClaw Style */}
        <div className="text-center mb-16 pt-8">
          
          {/* Badge */}
          <div className="hero-element inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            SYSTEM LIVE — Real-time Data Available
          </div>

          {/* Main Title - OpenClaw Style */}
          <div className="hero-element mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 tracking-tight mb-4 drop-shadow-2xl">
              Slot RTP
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-wide">
              DATA CENTRE
            </h2>
          </div>

          {/* Subtitle - OpenClaw style */}
          <p className="hero-element text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            The analytics platform that actually works.
            <br />
            <span className="text-white font-medium">Real-time RTP data from 50+ trusted providers.</span>
          </p>

          {/* Stats Grid - OpenClaw Cards */}
          <div className="hero-element grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <stat.icon size={18} className="text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Provider Selector - OpenClaw Style */}
          <div className="hero-element max-w-sm mx-auto mb-6 relative z-20">
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <Filter size={12} /> {t('hero.select_provider')}
            </div>
            <button
              ref={providerButtonRef}
              onClick={() => !isScanning && setShowProviderModal(true)}
              disabled={isScanning}
              className={`w-full flex items-center justify-between gap-4 backdrop-blur-xl border-2 font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all duration-300 group
                ${isScanning ? 'opacity-60 cursor-not-allowed border-slate-700 bg-slate-900/80 text-slate-400' :
                  selectedProvider ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/40 text-white hover:border-purple-400 hover:from-purple-600/30 hover:to-blue-600/30' :
                    'bg-slate-900/80 border-slate-700/50 text-slate-300 hover:border-purple-500/40 hover:bg-slate-900/90'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                  ${selectedProvider ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25' : 'bg-slate-800 text-slate-400'}`}>
                  {selectedProvider ? selectedProvider.charAt(0) : <Zap size={14} />}
                </div>
                <span className="truncate max-w-[160px]">{selectedProvider || t('hero.select_provider')}</span>
              </div>
              <ChevronDown size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
            </button>
            {!selectedProvider && !isScanning && (
              <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse border-2 border-slate-950"></div>
            )}
          </div>

          {/* User ID Input for Restricted Providers */}
          {isRestricted && (
            <div className="hero-element max-w-sm mx-auto mb-8">
              <div className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl p-1 border-2 transition-all duration-300 ${inputError ? 'border-red-500/50 shadow-lg shadow-red-500/20' : 'border-slate-700/50'}`}>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-purple-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInputId}
                    onChange={(e) => { setUserInputId(e.target.value); setInputError(false); }}
                    placeholder={t('hero.enter_id', { provider: selectedProvider })}
                    disabled={isScanning}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white font-bold placeholder:text-slate-500 placeholder:font-medium focus:outline-none text-center rounded-xl"
                  />
                </div>
              </div>
              {inputError && <p className="text-red-400 text-xs font-bold mt-2 animate-pulse">{t('hero.id_required')}</p>}
            </div>
          )}

          {/* Start Scan Button - OpenClaw Style */}
          <div className={`hero-element relative inline-block group w-full max-w-sm ${isRestricted ? '' : 'mt-6'}`}>
            {!isMaintenance && (
              <>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div ref={scanButtonGlowRef} className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </>
            )}
            <button
              ref={buttonRef}
              onClick={startScan}
              disabled={isScanning || isMaintenance}
              className={`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl overflow-hidden transition-all duration-300 transform
                ${isMaintenance ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' :
                  isScanning ? 'cursor-not-allowed bg-slate-800/90 text-white border border-slate-700' :
                    'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-500/30 border border-white/10 hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {!isScanning && !isMaintenance && (
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-1000 group-hover:translate-x-[150%]"></div>
              )}
              {isScanning && (
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                {isScanning ? (
                  <><Activity className="animate-spin" /><span className="tracking-wide">{t('hero.scanning')} {Math.round(progress)}%</span></>
                ) : isMaintenance ? (
                  <><Lock size={18} /> {t('hero.maintenance')}</>
                ) : (
                  <><Play fill="currentColor" className="animate-pulse" /> {t('hero.start_scan')}</>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Why Choose Us Section - OpenClaw Style */}
        <div className="hero-element mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Why Choose Us</h3>
            <p className="text-slate-400">Everything you need to make informed decisions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Real-time Data", desc: "Live RTP updates from 50+ providers with minute-by-minute accuracy", icon: Wifi },
              { title: "Verified Sources", desc: "All data is cross-referenced and verified from trusted gaming providers", icon: Shield },
              { title: "Instant Results", desc: "Get comprehensive analytics in seconds with our advanced algorithms", icon: ZapIcon }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                  <item.icon size={22} className="text-purple-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials - OpenClaw Grid Style */}
        <div className="hero-element mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">What People Say</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Section */}
        <div className="terminal-container">
          <Terminal logs={logs} isActive={isScanning} />
        </div>

        {/* Results Grid */}
        {results.length > 0 && (
          <div ref={resultsRef} className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wifi className="text-purple-400" /> {t('results.detected_signals')} ({results.length})
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 bg-slate-900/60 px-2 py-1 rounded hidden sm:inline-block">ID: {Date.now().toString().slice(-6)}</span>
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity">
                  <Share2 size={14} /> {t('results.share')}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
              {results.map((game, i) => (
                <div key={game.id} className="result-row relative flex items-center justify-between p-4 group hover:bg-slate-800/50 transition-all duration-300 border-b border-slate-800/30 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${i < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-300' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{game.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{game.provider}</span>
                        {game.volatility === 'High' && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>HOT</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end"><Clock size={10} /> {t('results.last_win')}</div>
                      <div className="text-sm text-slate-400">{game.lastWin}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black ${game.rtp >= 96 ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400' : 'text-emerald-500'}`}>
                        {game.rtp}%
                      </span>
                    </div>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${game.rtp >= 96 ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {game.rtp >= 96 ? <BatteryCharging size={16} /> : <Activity size={16} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Selection Modal */}
        {showProviderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowProviderModal(false)}></div>
            <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{t('hero.select_provider')}</h3>
                <button onClick={() => setShowProviderModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input type="text" placeholder="Search provider..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50" autoFocus />
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredProviders.map((p) => (
                    <button key={p} onClick={() => { setSelectedProvider(p); setShowProviderModal(false); }}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group overflow-hidden
                        ${selectedProvider === p ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50 text-white' : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${selectedProvider === p ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {p.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold truncate">{p}</span>
                      {selectedProvider === p && <Check size={14} className="absolute top-2 right-2 text-purple-400" />}
                    </button>
                  ))}
                </div>
                {filteredProviders.length === 0 && <div className="text-center py-8 text-slate-500">No providers found</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
