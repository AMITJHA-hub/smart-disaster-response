"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Loader2, Zap, ShieldAlert, TrendingUp, Brain } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export const AICopilot = ({ contextData }: { contextData: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user' | 'system'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Response Copilot. I can help you analyze emergencies, find volunteers, predict shortages, and coordinate responses. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetchApi<{ response: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, context: contextData })
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', text: '⚠ Connection to the intelligence server failed. The system is using offline fallback mode.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action buttons with special API calls
  const handleQuickAction = async (action: string) => {
    setShowQuickActions(false);
    
    switch (action) {
      case 'priorities': {
        setMessages(prev => [...prev, { role: 'user', text: '📊 Show me emergency priority ranking' }]);
        setIsLoading(true);
        try {
          const res = await fetchApi<{ priorities: string }>('/ai/emergency-priorities', {
            method: 'POST',
            body: JSON.stringify({ emergencies: contextData.emergencies || [] })
          });
          setMessages(prev => [...prev, { role: 'ai', text: `📊 **Emergency Priority Ranking:**\n\n${res.priorities}` }]);
        } catch {
          setMessages(prev => [...prev, { role: 'system', text: 'Unable to fetch priorities.' }]);
        } finally {
          setIsLoading(false);
        }
        break;
      }
      case 'insight': {
        setMessages(prev => [...prev, { role: 'user', text: '🧠 Give me a situation overview' }]);
        setIsLoading(true);
        try {
          const res = await fetchApi<{ insight: string }>('/ai/dashboard-insights', {
            method: 'POST',
            body: JSON.stringify({ emergencies: contextData.emergencies || [], volunteers: contextData.volunteers || [], resources: [] })
          });
          setMessages(prev => [...prev, { role: 'ai', text: `🧠 **Situation Overview:**\n\n${res.insight}` }]);
        } catch {
          setMessages(prev => [...prev, { role: 'system', text: 'Unable to generate insights.' }]);
        } finally {
          setIsLoading(false);
        }
        break;
      }
      default:
        handleSend(action);
    }
  };

  const suggestions = [
    { icon: <ShieldAlert size={12} />, label: 'Priority Ranking', action: 'priorities' },
    { icon: <Brain size={12} />, label: 'Situation Overview', action: 'insight' },
    { icon: <Zap size={12} />, label: 'Available Volunteers', action: 'Which volunteers are currently available?' },
    { icon: <TrendingUp size={12} />, label: 'Resource Status', action: 'What is the current resource shortage situation?' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed btn btn-circle btn-lg shadow-xl z-50 transition-all duration-300 ${
          isOpen 
            ? 'bg-base-300 text-base-content hover:bg-base-200 rotate-90 scale-90' 
            : 'btn-primary shadow-indigo-500/30 hover:scale-110 ai-glow'
        }`}
        style={{ position: 'fixed', right: '24px', bottom: '24px', left: 'auto', zIndex: 9999 }}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="w-[420px] h-[560px] glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden ai-card-reveal ai-gradient-border"
          style={{ position: 'fixed', right: '24px', bottom: '100px', left: 'auto', zIndex: 9999 }}
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot size={22} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse"></span>
              </div>
              <div>
                <p className="font-semibold text-sm">AI Response Copilot</p>
                <p className="text-[10px] text-white/60">Gemini-powered • Always listening</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-base-200/30">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'} ai-card-reveal`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {msg.role === 'system' ? (
                  <div className="chat-bubble bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20 shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`chat-bubble text-sm leading-relaxed ${
                    msg.role === 'ai' 
                      ? 'bg-base-100 text-base-content shadow-sm border border-base-300/30' 
                      : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="chat chat-start ai-card-reveal">
                <div className="chat-bubble bg-base-100 shadow-sm border border-base-300/30 flex items-center gap-1.5 py-3 px-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 ai-typing-dot"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 ai-typing-dot"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 ai-typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions + Input */}
          <div className="p-4 bg-base-100/80 backdrop-blur-sm border-t border-base-300/50">
            {/* Quick action pills */}
            {showQuickActions && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => s.action === 'priorities' || s.action === 'insight' ? handleQuickAction(s.action) : handleSend(s.action)}
                    className="flex items-center gap-1.5 text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1.5 rounded-full hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all ai-badge-pop"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Input bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Copilot anything..." 
                className="input input-sm flex-1 bg-base-200/60 border-base-300/50 focus:bg-base-200 focus:border-indigo-500/50 focus:outline-none transition-all text-sm rounded-xl"
              />
              <button 
                type="submit" 
                className="btn btn-sm btn-primary btn-square rounded-xl shadow-sm shadow-indigo-500/20"
                disabled={!input.trim() || isLoading}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
