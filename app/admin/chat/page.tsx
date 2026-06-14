'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Phone, Mail, Clock, Bell, BellRing } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

type Conversation = {
  id: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  status: string;
  createdAt: string;
  messages?: any[];
};

type ChatMsg = {
  id: string;
  conversationId: string;
  senderType: 'GUEST' | 'ADMIN';
  senderId?: string;
  senderName?: string;
  content: string;
  createdAt: string;
};

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch {}
}

export default function AdminChatPage() {
  const { token, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTitle = useRef('');

  useEffect(() => {
    prevTitle.current = document.title;
  }, []);

  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Live Chat - Vedara Admin`;
    } else {
      document.title = prevTitle.current || 'Live Chat - Vedara Admin';
    }
    return () => { document.title = prevTitle.current; };
  }, [unreadCount]);

  useEffect(() => {
    if (!token) return;
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);
    return () => { s.close(); };
  }, [token]);

  useEffect(() => {
    if (!socket || !token) return;
    socket.on('connect', () => {
      socket.emit('join:admin');
      setConnected(true);
    });
    socket.on('chat:new', (data: { conversation: Conversation }) => {
      setConversations(prev => [data.conversation, ...prev.filter(c => c.id !== data.conversation.id)]);
      if (!document.hasFocus()) setUnreadCount(prev => prev + 1);
      playNotificationSound();
    });
    socket.on('chat:message', (data: { conversationId: string; message: ChatMsg }) => {
      if (selectedId === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
      } else if (!document.hasFocus()) {
        setUnreadCount(prev => prev + 1);
      }
      setConversations(prev => prev.map(c => c.id === data.conversationId ? { ...c, status: 'ACTIVE' } : c));
    });
    socket.on('chat:admin-sent', (data: { message: ChatMsg }) => {
      setMessages(prev => [...prev, data.message]);
    });
    socket.on('chat:closed', (data: { conversationId: string }) => {
      setConversations(prev => prev.filter(c => c.id !== data.conversationId));
      if (selectedId === data.conversationId) setSelectedId(null);
    });
    return () => {
      socket.off('connect');
      socket.off('chat:new');
      socket.off('chat:message');
      socket.off('chat:admin-sent');
      socket.off('chat:closed');
    };
  }, [socket, token, selectedId]);

  useEffect(() => {
    if (!token) return;
    api.get('/chat/conversations', token).then((res: any) => {
      setConversations(res.data || []);
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!selectedId || !token) return;
    api.get(`/chat/conversations/${selectedId}/messages`, token).then((res: any) => {
      setMessages(res.data || []);
    }).catch(() => {});
  }, [selectedId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleFocus = () => setUnreadCount(0);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleSend = () => {
    if (!input.trim() || !socket || !selectedId || !user) return;
    socket.emit('chat:admin-reply', {
      conversationId: selectedId,
      content: input.trim(),
      adminName: user.name,
      adminId: user.id,
    });
    setInput('');
  };

  const handleClose = () => {
    if (!socket || !selectedId) return;
    socket.emit('chat:close', { conversationId: selectedId });
  };

  const selectedConv = conversations.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen pt-16 bg-alabaster">
      <div className="w-80 border-r border-border bg-white flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gold-600" />
              Live Chats
            </h2>
            {unreadCount > 0 && (
              <Badge variant="success" size="sm" className="animate-pulse">
                <BellRing className="w-3 h-3 mr-1" />{unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} active</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No active conversations</div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => { setSelectedId(conv.id); }}
                className={`w-full text-left p-4 border-b border-border hover:bg-earth-50 transition-colors ${
                  selectedId === conv.id ? 'bg-gold-50 border-l-4 border-l-gold-600' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground truncate">{conv.guestName}</span>
                  <Badge variant="success" size="sm">Live</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(conv.createdAt).toLocaleTimeString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-forest-700 font-bold text-sm">
                  {selectedConv.guestName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{selectedConv.guestName}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {selectedConv.guestEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedConv.guestEmail}</span>}
                    {selectedConv.guestPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedConv.guestPhone}</span>}
                  </div>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={handleClose}>
                <X className="w-4 h-4 mr-1" /> Close
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.senderType === 'ADMIN'
                      ? 'bg-gold-600 text-alabaster rounded-br-sm'
                      : 'bg-gold-100 text-earth-800 rounded-bl-sm'
                  }`}>
                    <div className="text-xs opacity-70 mb-0.5">{msg.senderName || (msg.senderType === 'ADMIN' ? 'You' : 'Guest')}</div>
                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-xl border border-border bg-earth-50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-forest-500"
                />
                <Button variant="primary" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a guest chat from the left to start replying</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}