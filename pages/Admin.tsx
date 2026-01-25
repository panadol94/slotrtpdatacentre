// Imports at top
import React, { useState, useEffect, useRef } from 'react';
import { Server, Layout, Folder, FileText, Image as ImageIcon, LogOut, Plus, Trash2, Save, Upload, Check, AlertCircle, X, Menu, ArrowLeft } from 'lucide-react';
import Cropper from 'react-easy-crop';
// import { removeBackground } from '@imgly/background-removal'; // Commented out to rule out WASM crash

// Error Boundary for Debugging
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Admin Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-screen overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">⚠️ Admin Panel Crashed</h1>
                    <pre className="bg-white p-4 rounded border border-red-200 overflow-auto text-xs font-mono">
                        {this.state.error?.toString()}
                    </pre>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// New Modal Component for Image Editing
interface ImageUploaderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (blob: Blob) => void;
    initialImage?: string; // If editing existing
}

const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({ isOpen, onClose, onUpload, initialImage }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleRemoveBg = async () => {
        if (!imageSrc) return;
        setIsProcessing(true);
        try {
            // const blob = await removeBackground(imageSrc);
            // const url = URL.createObjectURL(blob);
            // setImageSrc(url);
            alert("Background removal temporarily disabled for stability check.");
        } catch (error) {
            console.error(error);
            alert("Failed to remove background");
        }
        setIsProcessing(false);
    };

    const createCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const image = new window.Image();
            image.src = imageSrc;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Wait for image load if needed (usually cached by now)
            await new Promise(resolve => image.onload = resolve);

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx?.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob((blob) => {
                if (blob) onUpload(blob);
            }, 'image/png');
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Image Editor</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <div className="flex-1 relative bg-slate-900 min-h-[300px]">
                    {imageSrc ? (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                            onZoomChange={setZoom}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                            <label className="cursor-pointer bg-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition">
                                Upload Image
                                <input type="file" className="hidden" onChange={onSelectFile} accept="image/*" />
                            </label>
                        </div>
                    )}
                </div>

                {imageSrc && (
                    <div className="p-4 bg-slate-50 border-t space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-bold text-slate-500">Zoom</label>
                            <input
                                type="range"
                                min={1} max={3} step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRemoveBg}
                                disabled={isProcessing}
                                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing AI...' : '✨ Remove Background'}
                            </button>
                            <button
                                onClick={createCroppedImage}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
                            >
                                Save & Use
                            </button>
                            <button onClick={() => setImageSrc(null)} className="px-4 py-2 border rounded-lg hover:bg-slate-100">Reset</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Internal Content Component
const AdminContent: React.FC = () => {

    // New State for Advanced Features
    const [viewMode, setViewMode] = useState<'list' | 'raw'>('list');
    const [editingGame, setEditingGame] = useState<{ name: string, originalName: string } | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [uploadTargetGame, setUploadTargetGame] = useState<string>("");

    const handleUploadProcessed = async (blob: Blob) => {
        if (!selectedProvider || !uploadTargetGame) return;

        const formData = new FormData();
        formData.append('file', blob, 'image.png');
        formData.append('provider', selectedProvider);
        formData.append('type', 'game');
        formData.append('gameName', uploadTargetGame);

        try {
            setStatusMsg({ type: 'success', text: "Uploading processed image..." });
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
            if (res.ok) {
                setStatusMsg({ type: 'success', text: "Image updated!" });
                fetchImages(selectedProvider);
                setShowImageModal(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRenameGame = async () => {
        if (!editingGame || !selectedProvider) return;
        if (editingGame.name === editingGame.originalName) {
            setEditingGame(null);
            return;
        }

        try {
            // 1. Rename Image File
            await fetch(`${API_URL}/rename-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: selectedProvider,
                    oldName: editingGame.originalName,
                    newName: editingGame.name
                })
            });

            // 2. Update Text List Logic
            // Parse current content -> find line -> replace -> save
            const lines = gamesContent.split('\n');
            const newLines = lines.map(line => line.trim() === editingGame.originalName ? editingGame.name : line);

            // Save Updated List
            await fetch(`${API_URL}/games/${encodeURIComponent(selectedProvider)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newLines.join('\n') })
            });

            // Refresh
            setGamesContent(newLines.join('\n'));
            fetchImages(selectedProvider);
            setStatusMsg({ type: 'success', text: "Game renamed successfully" });
            setEditingGame(null);

        } catch (err) {
            console.error(err);
            setStatusMsg({ type: 'error', text: "Failed to rename" });
        }
    };

    // ... Inside Render -> Games Tab ...
    // Replace the simple textarea with this Toggle View

    /* 
       UI Implementation:
       Toggle Button: [List View] | [Raw Text]
       
       List View:
       - Maps `gamesContent.split('\n')`
       - Row: [Image Thumbnail] [Input Field (Name)] [Crop/Upload Button] [Delete Button]
       
       Raw Text: (Keep existing textarea for bulk paste)
    */

    // Helper to get image for a game name
    const getGameImage = (name: string) => {
        const match = gameImages.find(img => img.replace(/\.(png|jpg|webp)$/i, '') === name);
        return match ? `/providers/${encodeURIComponent(selectedProvider)}/${match}?t=${refreshTrigger}` : null;
    };

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");

    // Data State
    const [providers, setProviders] = useState<{ name: string, hasLogo: boolean }[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [gameImages, setGameImages] = useState<string[]>([]);

    // Form State
    const [newProviderName, setNewProviderName] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [gamesContent, setGamesContent] = useState("");
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // APIs
    const API_URL = '/api';

    useEffect(() => {
        if (isAuthenticated) {
            fetchProviders();
        }
    }, [isAuthenticated, refreshTrigger]);

    useEffect(() => {
        if (isAuthenticated && selectedProvider) {
            fetchGames(selectedProvider);
        }
    }, [selectedProvider]);

    const fetchProviders = async () => {
        try {
            const res = await fetch(`${API_URL}/providers`);
            const data = await res.json();
            setProviders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch providers", err);
            setProviders([]);
        }
    };

    const fetchGames = async (providerName: string) => {
        try {
            setGamesContent("Loading...");
            const res = await fetch(`${API_URL}/games/${encodeURIComponent(providerName)}`);
            const data = await res.json();
            setGamesContent(data.content || "");

            // Also fetch images
            fetchImages(providerName);
        } catch (err) {
            console.error("Failed to fetch games", err);
            setGamesContent("");
        }
    };

    const fetchImages = async (providerName: string) => {
        try {
            const res = await fetch(`${API_URL}/images/${encodeURIComponent(providerName)}`);
            if (res.ok) {
                const data = await res.json();
                setGameImages(Array.isArray(data) ? data : []);
            } else {
                setGameImages([]);
            }
        } catch (err) {
            console.error(err);
            setGameImages([]);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            setIsAuthenticated(true);
        } else {
            alert("Wrong Password");
        }
    };

    const handleCreateProvider = async () => {
        if (!newProviderName.trim()) return;
        try {
            const res = await fetch(`${API_URL}/providers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProviderName })
            });
            if (res.ok) {
                setNewProviderName("");
                setRefreshTrigger(prev => prev + 1);
                setStatusMsg({ type: 'success', text: `Provider ${newProviderName} created` });
            } else {
                const err = await res.json();
                setStatusMsg({ type: 'error', text: err.error });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: "Request failed" });
        }
    };

    const handleDeleteProvider = async (name: string) => {
        if (!confirm(`Delete provider ${name} and all its data? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_URL}/providers/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setRefreshTrigger(prev => prev + 1);
                if (selectedProvider === name) setSelectedProvider("");
                setStatusMsg({ type: 'success', text: `Provider deleted` });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveGames = async () => {
        if (!selectedProvider) return;
        try {
            const res = await fetch(`${API_URL}/games/${encodeURIComponent(selectedProvider)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: gamesContent })
            });
            if (res.ok) {
                setStatusMsg({ type: 'success', text: "Games list saved!" });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: "Save failed" });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'game', gameName?: string) => {
        if (!e.target.files || !e.target.files[0]) return;
        if (!selectedProvider) return alert("Select a provider first");

        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('provider', selectedProvider);
        formData.append('type', type);
        if (gameName) formData.append('gameName', gameName);

        try {
            setStatusMsg({ type: 'success', text: "Uploading..." });
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setStatusMsg({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Image'} uploaded successfully!` });
                if (type === 'logo') setRefreshTrigger(prev => prev + 1);
                if (type === 'game') fetchImages(selectedProvider);
            } else {
                setStatusMsg({ type: 'error', text: "Upload failed" });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: "Error uploading file" });
        }
    };

    // ... Views ...

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Server className="text-primary-600" /> Admin Panel
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Enter password"
                            />
                        </div>
                        <button className="w-full bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }



    // ... Imports
    const [waStatus, setWaStatus] = useState<{ status: string, qr: string | null }>({ status: 'LOADING', qr: null });

    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(fetchWaStatus, 5000); // Poll every 5s
            fetchWaStatus();
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchWaStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/whatsapp/status`);
            const data = await res.json();
            setWaStatus(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                    {selectedProvider ? `Edit: ${selectedProvider}` : 'Control Center'}
                                </h1>
                                {!selectedProvider && (
                                    <button
                                        onClick={() => setIsAuthenticated(false)}
                                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-1 transition"
                                    >
                                        <LogOut size={14} /> Logout
                                    </button>
                                )}
                            </div>
                            {/* WhatsApp Status Indicator (Always Visible) */}
                            <div className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-fit">
                                <span className="font-bold text-slate-600">Bot Status:</span>
                                {waStatus.status === 'CONNECTED' && <span className="flex items-center gap-1 text-green-600 font-bold"><Check size={14} /> Active</span>}
                                {waStatus.status === 'QR_READY' && <span className="flex items-center gap-1 text-orange-600 font-bold"><AlertCircle size={14} /> Scan QR Below</span>}
                                {waStatus.status === 'INITIALIZING' && <span className="text-slate-400">Initializing...</span>}
                                {waStatus.status === 'DISCONNECTED' && <span className="text-red-500 font-bold">Disconnected</span>}
                            </div>
                        </div>

                        {statusMsg && (
                            <div className={`w-full md:w-auto px-4 py-2 rounded-lg flex items-center justify-between gap-2 ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <div className="flex items-center gap-2">
                                    {statusMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                    <span className="text-sm font-medium">{statusMsg.text}</span>
                                </div>
                                <button onClick={() => setStatusMsg(null)} className="hover:opacity-70"><X size={14} /></button>
                            </div>
                        )}
                    </div>

                    {/* WhatsApp QR Panel (Visible when needed, regardless of page) */}
                    {waStatus.status === 'QR_READY' && waStatus.qr && (
                        <div className="mb-8 bg-orange-50 border border-orange-200 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 animate-pulse-slow">
                            <div className="bg-white p-2 rounded-lg shadow-md">
                                <img src={waStatus.qr} alt="WhatsApp QR" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-orange-800 mb-2">WhatsApp Session Disconnected</h3>
                                <p className="text-orange-700 mb-4 max-w-lg">
                                    The bot needs to be re-linked. Open WhatsApp on your phone, go to <b>Linked Devices</b>, and scan this QR code immediately.
                                </p>
                                <div className="text-sm text-slate-500">
                                    Updates automatically when scanned.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Split View Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 min-h-[500px]">

                        {/* COLUMN 1: Provider List (Always Visible) */}
                        <div className="lg:col-span-1 flex flex-col gap-4">
                            {/* Create New */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-sm font-bold mb-3 text-slate-700 uppercase tracking-wider">Add Provider</h3>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Name..."
                                        value={newProviderName}
                                        onChange={e => setNewProviderName(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    <button
                                        onClick={handleCreateProvider}
                                        disabled={!newProviderName}
                                        className="bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Plus size={16} /> Create
                                    </button>
                                </div>
                            </div>

                            {/* Providers List */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col max-h-[400px] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-sm sticky top-0">
                                    All Providers ({Array.isArray(providers) ? providers.length : 0})
                                </div>
                                <div className="p-2 space-y-1">
                                    {Array.isArray(providers) && providers.map(p => (
                                        <button
                                            key={p.name}
                                            onClick={() => setSelectedProvider(p.name)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center group ${selectedProvider === p.name ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-200' : 'hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${p.hasLogo ? 'bg-white' : 'bg-slate-100'}`}>
                                                    {p.hasLogo ? (
                                                        <img src={`/providers/${encodeURIComponent(p.name)}/logo.png?t=${refreshTrigger}`} alt="logo" className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        <ImageIcon size={14} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="truncate text-sm">{p.name}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                <label onClick={e => e.stopPropagation()} className="cursor-pointer p-1.5 hover:bg-white rounded text-blue-600" title="Upload Logo">
                                                    <Upload size={14} />
                                                    <input type="file" accept="image/png" className="hidden" onChange={(e) => {
                                                        setSelectedProvider(p.name);
                                                        handleFileUpload(e, 'logo');
                                                    }} />
                                                </label>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProvider(p.name); }}
                                                    className="p-1.5 hover:bg-white rounded text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: Editor (Right Side) */}
                        <div className="lg:col-span-2 flex flex-col h-full">
                            {selectedProvider ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {/* Editor Card */}
                                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <FileText size={20} className="text-primary-500" />
                                                Editing: <span className="text-primary-700">{selectedProvider}</span>
                                            </h3>
                                            <button
                                                onClick={handleSaveGames}
                                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-bold shadow-sm active:scale-95"
                                            >
                                                <Save size={18} /> Save List
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3 text-xs text-slate-500">
                                            Enter game names below, one per line.
                                        </div>
                                        <textarea
                                            value={gamesContent}
                                            onChange={e => setGamesContent(e.target.value)}
                                            className="w-full h-80 md:h-[500px] border border-slate-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed"
                                            placeholder="Game 1&#10;Game 2&#10;Game 3..."
                                        />
                                    </div>

                                    {/* Images Grid */}
                                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold">Game Images</h3>
                                            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{gameImages.length} Found</span>
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-1">
                                            {gameImages.map(img => (
                                                <div key={img} className="group relative aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-primary-400 transition" title={img}>
                                                    <img
                                                        src={`/providers/${encodeURIComponent(selectedProvider)}/${img}?t=${refreshTrigger}`}
                                                        alt={img}
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] p-1 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {img.replace('.png', '')}
                                                    </div>
                                                </div>
                                            ))}
                                            {gameImages.length === 0 && (
                                                <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-8 gap-2 border-2 border-dashed border-slate-100 rounded-xl">
                                                    <ImageIcon size={32} className="opacity-20" />
                                                    <span className="text-sm">No images found for this provider</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Card */}
                                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                        <h3 className="text-lg font-bold mb-4">Upload New Image</h3>
                                        <div className="flex flex-col md:flex-row gap-3">
                                            <input
                                                type="text"
                                                placeholder="Game Name (Exact Match)"
                                                id="gameNameInput"
                                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            <label className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-slate-900 transition active:scale-95 shadow-sm whitespace-nowrap">
                                                <Upload size={18} /> Select File
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                    const nameInput = document.getElementById('gameNameInput') as HTMLInputElement;
                                                    if (!nameInput.value) {
                                                        alert("Please enter Game Name first");
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    handleFileUpload(e, 'game', nameInput.value);
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/50 rounded-xl border-dashed border-2 border-slate-200 p-8 text-center animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <Layout size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-500">Start Editing</h3>
                                    <p className="text-sm max-w-xs mt-2">Select a provider from the list on the left to manage their games and images.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {/* Image Editor Modal */}
            <ImageUploaderModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onUpload={handleUploadProcessed}
                initialImage={undefined}
            />
        </div>
    );
};

// Export Wrapped with Error Boundary
export const Admin = () => (
    <ErrorBoundary>
        <AdminContent />
    </ErrorBoundary>
);
