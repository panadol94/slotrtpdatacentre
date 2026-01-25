// Imports at top
import React, { useState, useEffect, useRef } from 'react';
import { Server, Layout, Folder, FileText, Image, LogOut, Plus, Trash2, Save, Upload, Check, AlertCircle, X, Menu, ArrowLeft } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { removeBackground } from '@imgly/background-removal';

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
            const blob = await removeBackground(imageSrc);
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
        } catch (error) {
            console.error(error);
            alert("Failed to remove background");
        }
        setIsProcessing(false);
    };

    const createCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const image = new Image();
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
// ... In Admin Component ...

export const Admin: React.FC = () => {

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

    // ... See replacement in actual tool call execution ...

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<'providers' | 'games'>('providers');

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
        if (isAuthenticated && selectedProvider && activeTab === 'games') {
            fetchGames(selectedProvider);
        }
    }, [selectedProvider, activeTab]);

    const fetchProviders = async () => {
        try {
            const res = await fetch(`${API_URL}/providers`);
            const data = await res.json();
            setProviders(data);
        } catch (err) {
            console.error("Failed to fetch providers", err);
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
                setGameImages(data);
            } else {
                setGameImages([]);
            }
        } catch (err) {
            console.error(err);
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Server size={20} className="text-primary-400" /> Control Center
                </h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <button
                    onClick={() => { setActiveTab('providers'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'providers' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800'}`}
                >
                    <Folder size={18} /> Providers
                </button>
                <button
                    onClick={() => { setActiveTab('games'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'games' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800'}`}
                >
                    <FileText size={18} /> Games & Images
                </button>
            </nav>
            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={() => setIsAuthenticated(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-20 sticky top-0 shadow-md">
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <Server size={18} className="text-primary-400" /> Admin
                </h1>
                <button onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                            {activeTab === 'providers' ? 'Manage Providers' : 'Manage Games'}
                        </h1>
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

                    {/* Providers Tab */}
                    {activeTab === 'providers' && (
                        <div className="space-y-6">
                            {/* Create New */}
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold mb-4">Add New Provider</h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="Provider Name (e.g. Mega888)"
                                        value={newProviderName}
                                        onChange={e => setNewProviderName(e.target.value)}
                                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    <button
                                        onClick={handleCreateProvider}
                                        disabled={!newProviderName}
                                        className="bg-primary-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Create
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {providers.map(p => (
                                    <div key={p.name} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start group hover:shadow-md transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                                {p.hasLogo ? (
                                                    <img src={`/providers/${encodeURIComponent(p.name)}/logo.png?t=${refreshTrigger}`} alt="logo" className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <Image size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 break-all">{p.name}</h4>
                                                <p className="text-xs text-slate-500">{p.hasLogo ? 'Logo Active' : 'No Logo'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {/* Hidden upload */}
                                            <label className="cursor-pointer text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded flex items-center gap-1">
                                                <Upload size={12} /> Upload
                                                <input type="file" accept="image/png" className="hidden" onChange={(e) => {
                                                    setSelectedProvider(p.name);
                                                    handleFileUpload(e, 'logo');
                                                }} />
                                            </label>
                                            <button
                                                onClick={() => handleDeleteProvider(p.name)}
                                                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Games Tab */}
                    {activeTab === 'games' && (
                        <div className="flex flex-col h-full">
                            {/* Mobile Back Button (Only when provider selected) */}
                            {selectedProvider && (
                                <button
                                    onClick={() => setSelectedProvider("")}
                                    className="lg:hidden mb-4 flex items-center gap-2 text-slate-600 hover:text-primary-600 font-bold"
                                >
                                    <ArrowLeft size={20} /> Back to Providers
                                </button>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 h-full">
                                {/* Sidebar List (Provider Selector) */}
                                {/* Mobile: Show only if NO provider selected. Desktop: Always show. */}
                                <div className={`
                                    bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col
                                    ${selectedProvider ? 'hidden lg:flex' : 'flex h-full'}
                                    lg:h-[calc(100vh-200px)]
                                `}>
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">
                                        Select Provider
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                        {providers.map(p => (
                                            <button
                                                key={p.name}
                                                onClick={() => setSelectedProvider(p.name)}
                                                className={`w-full text-left px-4 py-4 md:py-3 rounded-lg transition-colors flex justify-between items-center ${selectedProvider === p.name ? 'bg-primary-50 text-primary-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                                            >
                                                {p.name}
                                                <span className="lg:hidden text-slate-300">→</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Editor */}
                                {/* Mobile: Show only if provider selected. Desktop: Always show (col-span-2). */}
                                <div className={`
                                    lg:col-span-2 space-y-6
                                    ${selectedProvider ? 'block' : 'hidden lg:block'}
                                `}>
                                    {selectedProvider ? (
                                        <>
                                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-bold">Edit Game List</h3>
                                                    <button
                                                        onClick={handleSaveGames}
                                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 md:py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base shadow-sm active:scale-95"
                                                    >
                                                        <Save size={18} /> <span className="inline">Save Changes</span>
                                                    </button>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-2">Enter game names, one per line.</p>
                                                <textarea
                                                    value={gamesContent}
                                                    onChange={e => setGamesContent(e.target.value)}
                                                    className="w-full h-64 md:h-96 border border-slate-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                                    placeholder="Game 1&#10;Game 2&#10;Game 3..."
                                                />
                                            </div>

                                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                                <h3 className="text-lg font-bold mb-4">Existing Game Images ({gameImages.length})</h3>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                                                    {gameImages.map(img => (
                                                        <div key={img} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200" title={img}>
                                                            <img
                                                                src={`/providers/${encodeURIComponent(selectedProvider)}/${img}?t=${refreshTrigger}`}
                                                                alt={img}
                                                                className="w-full h-full object-contain"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {img.replace('.png', '')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {gameImages.length === 0 && (
                                                        <div className="col-span-full text-center text-slate-400 py-4 text-sm">
                                                            No images found.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                                                <h3 className="text-lg font-bold mb-4">Upload Game Image</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Game Name"
                                                        id="gameNameInput"
                                                        className="border border-slate-300 rounded-lg px-4 py-3 md:py-2 outline-none"
                                                    />
                                                    <label className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-3 md:py-2 rounded-lg cursor-pointer hover:bg-slate-900 transition active:scale-95 shadow-sm">
                                                        <Upload size={18} /> Select Image
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
                                        </>
                                    ) : (
                                        <div className="hidden lg:flex h-full items-center justify-center text-slate-400 bg-white/50 rounded-xl border-dashed border-2 border-slate-200">
                                            Select a provider to manage games
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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


