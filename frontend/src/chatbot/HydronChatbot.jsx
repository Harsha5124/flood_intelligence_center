import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { sendHydronChat } from '../services/api';

const QUICK_PROMPTS = [
  "What is the current flood risk in Adyar?",
  "Are any critical warnings active?",
  "What is Chembarambakkam reservoir status?",
  "Show nearest evacuation shelters",
  "Explain the ML prediction model",
  "Who won the cricket match?"
];

export default function HydronChatbot({ currentBasin = 'adyar' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: "Hello! I am **Hydron**, your Tamil Nadu flood intelligence assistant.\n\nI monitor live river levels, reservoir storage, ML-based flood risk predictions, and evacuation shelters. How can I assist your operational decisions today?",
      isDomainRelevant: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  async function handleSend(textToSend) {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendHydronChat(query, currentBasin);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.response,
        isDomainRelevant: data.is_domain_relevant,
        topic: data.topic,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: "⚠️ Connection to Hydron intelligence engine interrupted. Please verify backend service.",
          isDomainRelevant: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[1000] flex items-center gap-2.5 rounded-full border border-cyan-400/50 bg-[#0c1930] px-4 py-3 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.45)] backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-300 hover:text-white"
          aria-label="Open Hydron Chatbot"
        >
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
          </div>
          <Bot className="h-5 w-5 text-cyan-400" />
          <span className="font-semibold text-sm tracking-wide">Ask Hydron</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[1000] flex h-[600px] w-[420px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-blue-500/40 bg-[#0c1930]/95 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-500/20 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-blue-950/60 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide text-white">HYDRON AI</h3>
                  <span className="flex items-center gap-1 rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Tamil Nadu Flood Decision Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Questions Chips */}
          <div className="border-b border-blue-500/10 bg-[#081122]/60 px-3 py-2">
            <div className="mb-1 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <Sparkles className="h-3 w-3 text-cyan-400" /> Suggested Prompts
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="whitespace-nowrap rounded-lg border border-blue-500/20 bg-blue-950/40 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400 hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-blue-950 text-cyan-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'border border-blue-500/20 bg-[#0e1f3d] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.sender === 'bot' && !m.isDomainRelevant && (
                    <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                      <AlertCircle className="h-3 w-3" /> Politely Declined (Out of Scope)
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.text}
                  </div>
                  <div className={`mt-1 text-[9px] ${m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                    {m.time}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-800 text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-blue-950 text-cyan-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-blue-500/20 bg-[#0e1f3d] px-4 py-3 text-slate-400 rounded-tl-none">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.4s]" />
                  <span className="ml-2 font-mono text-[10px] text-cyan-400">Consulting telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-blue-500/20 bg-[#081122]/90 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about river levels, flood risk, shelters..."
                className="flex-1 rounded-xl border border-blue-500/30 bg-[#0c1930] px-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-cyan-500 hover:text-black disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
