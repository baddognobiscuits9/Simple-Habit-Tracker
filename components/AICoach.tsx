import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, User, Bot } from 'lucide-react';
import { Habit } from '../types';
import { getHabitCoaching } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface AICoachProps {
  habits: Habit[];
}

const AICoach: React.FC<AICoachProps> = ({ habits }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Initial analysis on first load
    if (!hasInitialized && habits.length > 0) {
      const initialAnalysis = async () => {
        setLoading(true);
        const response = await getHabitCoaching(habits);
        setMessages([{ role: 'assistant', content: response }]);
        setLoading(false);
        setHasInitialized(true);
      };
      initialAnalysis();
    }
  }, [habits, hasInitialized]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const response = await getHabitCoaching(habits, userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  if (habits.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center border border-neutral-100 rounded-xl bg-neutral-50">
            <Sparkles className="text-neutral-400 mb-3" size={24} />
            <p className="text-neutral-600">Add some habits to start your AI coaching session.</p>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-[600px] border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
        <Sparkles size={16} className="text-amber-500" />
        <span className="font-medium text-sm text-neutral-900">Gemini Coach</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-black text-white' : 'bg-amber-100 text-amber-700'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-neutral-100 text-neutral-900 rounded-tr-sm' 
                : 'bg-white border border-neutral-100 text-neutral-700 shadow-sm rounded-tl-sm'}
            `}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0.5">
                  <ReactMarkdown 
                    components={{
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                      strong: ({node, ...props}) => <span className="font-semibold text-neutral-900" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Loader2 size={16} className="animate-spin" />
             </div>
             <div className="bg-white border border-neutral-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1 h-5 items-center">
                    <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral-100 bg-white">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for advice, patterns, or motivation..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 bg-neutral-900 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICoach;