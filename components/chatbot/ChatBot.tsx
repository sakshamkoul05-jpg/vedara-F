'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Phone, PhoneOff, MessageCircleMore, Clock } from 'lucide-react';
import { endpoints } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const SUPPORT_HOURS = { start: 8, end: 22.5 }; // 8:00 AM to 10:30 PM

function isWithinSupportHours(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours() + ist.getMinutes() / 60;
  return hours >= SUPPORT_HOURS.start && hours < SUPPORT_HOURS.end;
}

function getNextSupportTime(): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours() + ist.getMinutes() / 60;
  if (hours < SUPPORT_HOURS.start) {
    return `Today at 8:00 AM`;
  }
  const tomorrow = new Date(ist);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `Tomorrow at 8:00 AM`;
}

interface Message {
  role: 'user' | 'assistant' | 'live-user' | 'live-admin';
  content: string;
  senderName?: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I\'m Vedara\'s mountain concierge. Ask me about our cottages, café, or anything about your stay.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'ai' | 'live' | 'name-prompt'>('ai');
  const [guestName, setGuestName] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chat:connected', (data: { conversationId: string; message: any }) => {
      setConversationId(data.conversationId);
      setMessages(prev => [...prev, { role: 'live-admin', content: data.message.content, senderName: 'System' }]);
    });
    socket.on('chat:reply', (data: { message: any }) => {
      setMessages(prev => [...prev, { role: 'live-admin', content: data.message.content, senderName: data.message.senderName || 'Agent' }]);
    });
    socket.on('chat:closed', () => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'This conversation has been closed. Feel free to start a new chat anytime!' }]);
      setMode('ai');
      setConversationId(null);
      socket.close();
      setSocket(null);
    });
    socket.on('chat:error', (data: { message: string }) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      setMode('ai');
    });
    return () => {
      socket.off('chat:connected');
      socket.off('chat:reply');
      socket.off('chat:closed');
      socket.off('chat:error');
    };
  }, [socket]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');

    if (mode === 'live' && socket && conversationId) {
      setMessages(prev => [...prev, { role: 'live-user', content: userMessage }]);
      socket.emit('chat:message', { conversationId, content: userMessage, senderName: guestName });
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role === 'live-user' ? 'user' : m.role === 'live-admin' ? 'assistant' : m.role, content: m.content }));
      const res: any = await endpoints.chatbot.chat(userMessage, history);
      const reply = res?.reply || res?.data?.reply || res?.message || 'I received your message. How can I help?';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. You can call us at +91-91188-82242 or message us on WhatsApp.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, mode, socket, conversationId, messages, guestName]);

  const startLiveChat = () => {
    if (!isWithinSupportHours()) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Live support is currently unavailable. Our team is available ${getNextSupportTime()}. You can continue chatting with our AI assistant, or call us at +91-91188-82242.`
      }]);
      return;
    }
    setMode('name-prompt');
  };

  const submitName = () => {
    if (!guestName.trim()) return;
    setMode('live');
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);
    s.on('connect', () => {
      s.emit('chat:request', { name: guestName.trim() });
    });
    setMessages(prev => [...prev, { role: 'assistant', content: 'Connecting you to live support...' }]);
  };

  const handleQuickAction = useCallback((text: string) => {
    if (text === 'Live Support') {
      if (mode === 'live') return;
      startLiveChat();
      return;
    }
    setInput(text);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setIsLoading(true);
      endpoints.chatbot.chat(text, messages.slice(-6).map(m => ({ role: m.role === 'live-user' ? 'user' : m.role === 'live-admin' ? 'assistant' : m.role, content: m.content })))
        .then((res: any) => {
          const reply = res?.reply || res?.data?.reply || res?.message || 'I received your message. How can I help?';
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        })
        .catch(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. You can call us at +91-91188-82242 or message us on WhatsApp.' }]);
        })
        .finally(() => setIsLoading(false));
    }, 50);
  }, [mode, messages]);

  const handleCloseLiveChat = () => {
    if (socket && conversationId) {
      socket.emit('chat:close', { conversationId });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gold-600 text-alabaster shadow-lg hover:bg-gold-700 transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <a
        href="https://wa.me/919118882242"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-24 z-40 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 flex items-center justify-center"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-auto z-50 w-auto sm:w-96 h-[500px] max-h-[calc(100dvh-140px)] bg-alabaster dark:bg-[#1B1814] rounded-2xl shadow-2xl border border-gold-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            <div className="bg-gold-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === 'live' ? (
                  <MessageCircleMore className="w-5 h-5 text-alabaster" />
                ) : (
                  <Bot className="w-5 h-5 text-alabaster" />
                )}
                <span className="font-serif text-alabaster font-semibold">
                  {mode === 'live' ? 'Live Support' : 'Mountain Concierge'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {mode === 'live' && (
                  <button
                    onClick={handleCloseLiveChat}
                    className="text-alabaster hover:text-white p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-xs bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                    title="End live chat"
                    aria-label="End live chat"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => { setIsOpen(false); if (socket) { socket.close(); setSocket(null); } setMode('ai'); setConversationId(null); }}
                  className="text-alabaster hover:text-white transition-all hover:rotate-90 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10"
                  aria-label="Close chatbot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {mode !== 'live' && mode !== 'name-prompt' && (
              <div className="bg-gold-700/10 dark:bg-white/5 px-4 py-2 flex gap-2 overflow-x-auto">
                <button onClick={() => handleQuickAction('Show me cottages')} className="text-xs bg-gold-50 dark:bg-white/5 px-3 py-2.5 min-h-[44px] rounded-full whitespace-nowrap border border-gold-200 dark:border-white/10 text-vedara-900 dark:text-white/80 hover:bg-gold-600 hover:text-alabaster hover:border-gold-600 transition-colors">
                  Cottages
                </button>
                <button onClick={() => handleQuickAction('Café menu')} className="text-xs bg-gold-50 dark:bg-white/5 px-3 py-2.5 min-h-[44px] rounded-full whitespace-nowrap border border-gold-200 dark:border-white/10 text-vedara-900 dark:text-white/80 hover:bg-gold-600 hover:text-alabaster hover:border-gold-600 transition-colors">
                  Café Menu
                </button>
                <button onClick={() => handleQuickAction('Booking info')} className="text-xs bg-gold-50 dark:bg-white/5 px-3 py-2.5 min-h-[44px] rounded-full whitespace-nowrap border border-gold-200 dark:border-white/10 text-vedara-900 dark:text-white/80 hover:bg-gold-600 hover:text-alabaster hover:border-gold-600 transition-colors">
                  Booking
                </button>
                <button onClick={() => handleQuickAction('Live Support')} className="text-xs bg-gold-50 dark:bg-white/5 px-3 py-2.5 min-h-[44px] rounded-full whitespace-nowrap border border-gold-200 dark:border-white/10 text-vedara-900 dark:text-white/80 hover:bg-gold-600 hover:text-alabaster hover:border-gold-600 transition-colors flex items-center gap-1.5">
                  {isWithinSupportHours() ? <MessageCircleMore className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  Live Support
                </button>
              </div>
            )}

            {mode === 'name-prompt' ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full space-y-4">
                  <div className="text-center">
                    <MessageCircleMore className="w-10 h-10 text-gold-600 mx-auto mb-2" />
                    <h3 className="font-serif text-lg text-foreground">Live Support</h3>
                    <p className="text-sm text-muted-foreground mt-1">Please tell us your name to connect with our team.</p>
                  </div>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitName()}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border dark:border-white/10 bg-alabaster dark:bg-[#221E18] px-4 py-2.5 text-sm text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => setMode('ai')}>Back</Button>
                    <Button variant="primary" size="sm" className="flex-1" onClick={submitName} disabled={!guestName.trim()}>Connect</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
                {messages.slice(mode === 'live' ? -20 : undefined).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' || msg.role === 'live-user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user' || msg.role === 'live-user'
                        ? 'bg-gold-600 text-alabaster rounded-br-sm'
                        : msg.role === 'live-admin'
                        ? 'bg-gold-100 dark:bg-white/10 text-vedara-900 dark:text-white/90 rounded-bl-sm'
                        : 'bg-gold-50 dark:bg-white/5 text-vedara-900 dark:text-white/80 rounded-bl-sm'
                    }`}>
                      {msg.senderName && (msg.role === 'live-admin' || msg.role === 'live-user') && (
                        <div className="text-xs opacity-70 mb-0.5">{msg.senderName}</div>
                      )}
                      {msg.role === 'assistant' ? <p className="leading-relaxed whitespace-pre-line">{msg.content}</p> : <p className="leading-relaxed">{msg.content}</p>}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gold-50 dark:bg-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {mode !== 'name-prompt' && (
              <div className="p-3 border-t border-gold-200 dark:border-white/10">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={mode === 'live' ? 'Type your message...' : 'Ask me anything...'}
                    className="flex-1 rounded-xl border border-gold-200 dark:border-white/10 bg-alabaster dark:bg-[#221E18] px-3 py-3 min-h-[44px] text-sm text-vedara-900 dark:text-white placeholder:text-charcoal/50 dark:placeholder:text-white/30 focus:outline-none focus:border-gold-500 dark:focus:border-gold-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gold-600 text-alabaster hover:bg-gold-700 disabled:opacity-50 transition-colors"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Button({ variant, size, className, onClick, disabled, children }: {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const base = variant === 'primary'
    ? 'bg-gold-600 text-alabaster hover:bg-gold-700'
    : 'bg-gold-50 dark:bg-white/5 text-foreground dark:text-white/80 hover:bg-gold-100 dark:hover:bg-white/10';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${base} ${className || ''}`}
    >
      {children}
    </button>
  );
}