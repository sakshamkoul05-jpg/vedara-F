'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormattedText } from '@/components/ui/formatted-text';
import { MessageCircle, Send, X, Phone, Mail, User, Clock, ArrowLeft } from 'lucide-react';

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

export default function AdminChatPage() {
  const { token, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    });
    socket.on('chat:message', (data: { conversationId: string; message: ChatMsg }) => {
      if (selectedId === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
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
    <div className="flex h-screen pt-16 bg-cream-50 dark:bg-earth-900">
      <div className="w-80 border-r border-border bg-white dark:bg-earth-800 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-serif text-lg text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-forest-600" />
            Live Chats
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} active</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No active conversations
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-4 border-b border-border hover:bg-earth-50 dark:hover:bg-earth-700/50 transition-colors ${
                  selectedId === conv.id ? 'bg-forest-50 dark:bg-forest-900/20 border-l-4 border-l-forest-600' : ''
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
            <div className="p-4 border-b border-border bg-white dark:bg-earth-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center text-forest-700 font-bold text-sm">
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
                      ? 'bg-forest-600 text-cream-50 rounded-br-sm'
                      : 'bg-earth-200 dark:bg-earth-700 text-earth-800 dark:text-cream-200 rounded-bl-sm'
                  }`}>
                    <div className="text-xs opacity-70 mb-0.5">{msg.senderName || (msg.senderType === 'ADMIN' ? 'You' : 'Guest')}</div>
                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-white dark:bg-earth-800">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-xl border border-border bg-earth-50 dark:bg-earth-700 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-forest-500"
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