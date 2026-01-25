import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { Send, Users, LogOut, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Connect to the same host as the served page
const SOCKET_URL = '/';

interface Message {
  id: number;
  userId: number;
  username: string;
  content: string;
  type: string;
  created_at: string;
}

export const Chat: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 1. Check Auth
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    // 2. Init Socket
    const newSocket = io(SOCKET_URL, {
      auth: { token }, // Send JWT for handshake auth
      transports: ['websocket', 'polling'] // Force stable transport
    });

    setSocket(newSocket);

    // 3. Socket Events
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket Connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket Disconnected');
    });

    // Receive initial history
    newSocket.on('chat_history', (history: Message[]) => {
      setMessages(history);
      scrollToBottom();
    });

    // Receive new message
    newSocket.on('message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    // Receive online count update
    newSocket.on('online_count', (count: number) => {
      setOnlineCount(count);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
      if (err.message === 'Authentication error') {
        alert('Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    // Emit message to server
    socket.emit('message', input);
    setInput('');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  if (!user) return <div className="p-4 text-center">Loading Chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-slate-100 relative">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Member Chat</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Users size={12} /> {onlineCount} Online
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages.map((msg, index) => {
          const isMe = msg.username === user.username;
          const isAdmin = msg.username === 'admin'; // Or check role from msg

          return (
            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end gap-2 max-w-[80%]">
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0
                                ${isAdmin ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-slate-400'}
                            `}>
                    {msg.username.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className={`relative px-4 py-2 rounded-2xl shadow-sm text-sm break-words
                            ${isMe
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : isAdmin
                      ? 'bg-yellow-50 border border-yellow-200 text-slate-800 rounded-bl-none'
                      : 'bg-white text-slate-800 rounded-bl-none'
                  }
                        `}>
                  {!isMe && <div className={`text-[10px] font-bold mb-0.5 ${isAdmin ? 'text-yellow-600' : 'text-slate-500'}`}>{msg.username}</div>}
                  {msg.content}
                  <div className={`text-[9px] mt-1 text-right opacity-70 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed md:absolute bottom-16 md:bottom-0 left-0 right-0 bg-white p-3 border-t">
        <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="bg-primary-600 text-white p-3 rounded-full shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};