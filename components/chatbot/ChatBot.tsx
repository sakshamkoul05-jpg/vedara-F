'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Phone, Clock, Sparkles, ExternalLink, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { speechErrorMessage, useSpeechRecognition, useSpeechSynthesis } from '@/lib/voice';
import { useLanguage } from '@/lib/i18n/provider';

const SUPPORT_HOURS = { start: 8, end: 22.5 };

function isWithinSupportHours(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours() + ist.getMinutes() / 60;
  return hours >= SUPPORT_HOURS.start && hours < SUPPORT_HOURS.end;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: 'Namaste! 🏔️ I\'m Vedara\'s mountain concierge. Ask me about our cottages, café menu, treks, booking — anything about your stay in Jibhi!',
  timestamp: new Date(),
  quickReplies: ['Show cottages', 'Café menu', 'Things to do', 'How to book'],
};

const QUICK_TOPICS = [
  { label: '🏠 Cottages', value: 'Tell me about your cottages' },
  { label: '🍽️ Menu', value: 'What\'s on the café menu?' },
  { label: '📅 Book', value: 'How do I book a cottage?' },
  { label: '📍 Explore', value: 'What are the nearby attractions?' },
  { label: '🌤️ Weather', value: 'Best time to visit Jibhi?' },
  { label: '📞 Contact', value: 'How can I contact you?' },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSupportOnline, setIsSupportOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Off by default: a voice starting unprompted in a quiet room is startling. */
  const [speakReplies, setSpeakReplies] = useState(false);
  // Voice follows the site language: someone reading the site in Hebrew wants
  // to dictate in Hebrew, and being answered in an American accent is jarring.
  const { t, speechTag } = useLanguage();

  const synthesis = useSpeechSynthesis(speechTag);
  const recognition = useSpeechRecognition({
    lang: speechTag,
    onResult: (text) => {
      // Someone who asked out loud expects an answer out loud.
      setSpeakReplies(true);
      sendMessage(text);
    },
  });

  useEffect(() => {
    setIsSupportOnline(isWithinSupportHours());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Dictation streams into the same field the guest would type into, so what
  // is about to be sent is always visible.
  useEffect(() => {
    if (recognition.listening && recognition.transcript) setInput(recognition.transcript);
  }, [recognition.listening, recognition.transcript]);

  // Closing the window should not leave the mic live or a voice talking.
  useEffect(() => {
    if (!isOpen) {
      recognition.stop();
      synthesis.cancel();
    }
  }, [isOpen, recognition.stop, synthesis.cancel]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I\'m not sure how to help with that. Try asking about cottages, the café, or booking!',
        timestamp: new Date(),
        quickReplies: generateQuickReplies(text),
      };

      setMessages(prev => [...prev, botMsg]);
      if (speakReplies) synthesis.speak(botMsg.content);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I\'m having a connection hiccup! 🏔️ Please try again or call us at +91-80919-21222.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  function generateQuickReplies(lastUserMessage: string): string[] {
    const lower = lastUserMessage.toLowerCase();
    if (/cottage|room|stay/i.test(lower)) return ['View pricing', 'Check availability', 'See amenities'];
    if (/menu|food|cafe/i.test(lower)) return ['Breakfast', 'Dinner', 'Order now'];
    if (/book|reserve/i.test(lower)) return ['Check dates', 'Cancellation policy', 'Call to book'];
    if (/trek|activity|thing/i.test(lower)) return ['Jalori Pass', 'Jibhi Waterfall', 'GHNP'];
    if (/price|cost/i.test(lower)) return ['See all cottages', 'Current offers', 'Book now'];
    return ['Tell me more', 'Show cottages', 'Contact info'];
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow cursor-pointer group"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t('chat.title')}</h3>
                  <div className="flex items-center gap-1.5 text-xs opacity-90">
                    <span className={`w-2 h-2 rounded-full ${isSupportOnline ? 'bg-green-300' : 'bg-zinc-300'}`} />
                    {isSupportOnline ? 'AI Online' : 'AI Always Available'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {synthesis.supported && (
                  <button
                    onClick={() => {
                      // Turning it off mid-sentence should stop that sentence.
                      if (speakReplies) synthesis.cancel();
                      setSpeakReplies((on) => !on);
                    }}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                    aria-pressed={speakReplies}
                    title={speakReplies ? t('chat.stopReading') : t('chat.readAloud')}
                    aria-label={speakReplies ? t('chat.stopReading') : t('chat.readAloud')}
                  >
                    {speakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                )}
                {isSupportOnline && (
                  <a
                    href="https://wa.me/918091921222"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    title="WhatsApp us"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-amber-600" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">AI Concierge</span>
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-md'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                        {msg.quickReplies.map((reply) => (
                          <button
                            key={reply}
                            onClick={() => handleQuickReply(reply)}
                            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 ml-1"
                >
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Topics (show when few messages) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => handleQuickReply(topic.value)}
                    className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            )}

            {/* Support Banner */}
            {!isSupportOnline && messages.length > 1 && (
              <div className="mx-4 mb-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2 shrink-0">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <p className="text-[11px] text-blue-600 dark:text-blue-300">
                  Live support available 8AM–10:30PM IST. AI concierge is always here!
                </p>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 pb-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              {recognition.error && speechErrorMessage(recognition.error) && (
                <p className="text-[11px] text-red-500 px-1 pb-1.5">{speechErrorMessage(recognition.error)}</p>
              )}
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                recognition.listening
                  ? 'bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-400'
                  : 'bg-zinc-50 dark:bg-zinc-800'
              }`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={recognition.listening ? t('chat.listening') : t('chat.placeholder')}
                  className="flex-1 bg-transparent outline-none text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
                  disabled={isTyping}
                />
                {recognition.supported && (
                  <button
                    type="button"
                    onClick={recognition.toggle}
                    disabled={isTyping}
                    aria-pressed={recognition.listening}
                    aria-label={recognition.listening ? t('chat.stopListening') : t('chat.askByVoice')}
                    title={recognition.listening ? t('chat.stopListening') : t('chat.askByVoice')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-40 ${
                      recognition.listening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {recognition.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
