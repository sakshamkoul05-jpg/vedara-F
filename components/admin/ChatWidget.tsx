'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, X, Minimize2, Maximize2, BellRing } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

type Conversation = {
  id: string;
  guestName: string;
  status: string;
  createdAt: string;
};

type ChatMsg = {
  id: string;
  conversationId: string;
  senderType: 'GUEST' | 'ADMIN';
  senderName?: string;
  content: string;
  createdAt: string;
};

function playPing() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

export function ChatWidget() {
  const { token, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);
    return () => { s.close(); };
  }, [token]);

  useEffect(() => {
    if (!socket || !token) return;
    socket.on('connect', () => socket.emit('join:admin'));
    socket.on('chat:new', () => {
      if (!isOpen || isMinimized) setUnread(prev => prev + 1);
      playPing();
    });
    socket.on('chat:message', (data: { conversationId: string; message: ChatMsg }) => {
      if (selectedId === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
      if (!isOpen || isMinimized) setUnread(prev => prev + 1);
    });
    socket.on('chat:closed', (data: { conversationId: string }) => {
      setConversations(prev => prev.filter(c => c.id !== data.conversationId));
      if (selectedId === data.conversationId) setSelectedId(null);
    });
    return () => {
      socket.off('connect');
      socket.off('chat:new');
      socket.off('chat:message');
      socket.off('chat:closed');
    };
  }, [socket, token, isOpen, isMinimized, selectedId]);

  const fetchConversations = useRef(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${SOCKET_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data.data || []);
    } catch {}
  });

  useEffect(() => {
    if (!isOpen) return;
    fetchConversations.current();
    const timer = setInterval(fetchConversations.current, 5000);
    return () => clearInterval(timer);
  }, [isOpen, token]);

  useEffect(() => {
    if (!selectedId || !token) return;
    fetch(`${SOCKET_URL}/api/chat/conversations/${selectedId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => setMessages(d.data || [])).catch(() => {});
  }, [selectedId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket || !selectedId || !user) return;
    socket.emit('chat:admin-reply', {
      conversationId: selectedId,
      content: input.trim(),
      adminName: user.name,
      adminId: user.id,
    });
    setMessages(prev => [...prev, { id: Date.now().toString(), conversationId: selectedId, senderType: 'ADMIN', senderName: 'You', content: input.trim(), createdAt: new Date().toISOString() }]);
    setInput('');
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(0);
  };

  return (
    <>
      <button
        onClick={toggleOpen}
        className="relative fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Toggle live chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] bg-white dark:bg-earth-800 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          <div className="bg-emerald-600 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-100" />
              <span className="font-medium text-sm text-white">Live Support</span>
              {unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{unread}</span>}
            </div>
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/80 hover:text-white p-0.5">
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-0.5" aria-label="Close chat">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 flex">
                <div className="w-1/3 border-r border-border bg-earth-50 dark:bg-earth-900/50 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground text-center">No active chats</div>
                  ) : (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedId(conv.id)}
                        className={`w-full text-left p-3 border-b border-border text-xs hover:bg-earth-100 dark:hover:bg-earth-700/50 ${
                          selectedId === conv.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-l-emerald-600' : ''
                        }`}
                      >
                        <div className="font-medium text-foreground truncate">{conv.guestName}</div>
                        <div className="text-muted-foreground">{new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  {selectedId ? (
                    <>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {messages.length === 0 && <p className="text-xs text-muted-foreground text-center pt-4">No messages yet</p>}
                        {messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs ${
                              msg.senderType === 'ADMIN'
                                ? 'bg-emerald-600 text-white rounded-br-sm'
                                : 'bg-earth-100 dark:bg-earth-700 text-foreground rounded-bl-sm'
                            }`}>
                              <div className="opacity-70 mb-0.5">{msg.senderName || (msg.senderType === 'ADMIN' ? 'You' : 'Guest')}</div>
                              <p className="whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="p-2 border-t border-border">
                        <div className="flex gap-1.5">
                          <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Reply..."
                            className="flex-1 rounded-lg border border-border bg-earth-50 dark:bg-earth-700 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
                          />
                          <button onClick={handleSend} disabled={!input.trim()} className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
                      Select a conversation from the left
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2 border-t border-border bg-earth-50 dark:bg-earth-900/50 text-center">
                <a href="/admin/chat" className="text-xs text-emerald-600 hover:underline">Open full chat panel →</a>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}