import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Bot, 
  User, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, ActivePage } from '../types';

interface ChatbotViewProps {
  setActivePage: (page: ActivePage) => void;
}

const EXAMPLE_QUESTIONS = [
  'What is the critical LASA difference between Celebrex and Celexa?',
  'Explain interactions between Metformin and Atorvastatin',
  'What are common precautions for Amoxicillin + Clavulanate?',
  'How should patients manage missed doses of Losartan?',
  'Tamil: இந்த மாத்திரையை உணவுக்கு முன் அல்லது பின் உட்கொள்ள வேண்டுமா?'
];

export const ChatbotView: React.FC<ChatbotViewProps> = ({ setActivePage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Welcome to Medivexa AI Clinical Consultation. I can assist with medication safety, look-alike sound-alike drug disambiguation, dosage guidelines, and interaction checking. How can I assist your clinical review today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiConfiguredError, setAiConfiguredError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setAiConfiguredError(false);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.slice(-6) })
      });

      if (!res.ok) {
        throw new Error('AI service not configured');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setAiConfiguredError(true);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'AI service not configured: To activate real-time Gemini LLM reasoning, ensure GEMINI_API_KEY is configured on the server. You can also look up any verified monograph directly in the Medivexa Drug Reference Catalog.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Consultation session reset. How can I assist you?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setAiConfiguredError(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-purple-400" />
            <span>Medivexa AI Clinical Chatbot</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clinical decision support assistant for drug verification, dosage guidelines, and patient counseling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Medical Safety Disclaimer Banner */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Clinical Decision Support: All information provided must be cross-verified by licensed healthcare practitioners. Not a substitute for professional clinical judgment.
        </span>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[500px] max-h-[70vh]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-cyan-600 text-white'
                      : 'bg-purple-950 border border-purple-500/40 text-purple-300'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm space-y-1.5 leading-relaxed relative group ${
                    isUser
                      ? 'bg-cyan-900/50 border border-cyan-700/50 text-cyan-50 rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-between gap-4 pt-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 hover:text-slate-200 transition-opacity flex items-center gap-1"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 max-w-lg">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Consulting Medivexa Clinical Knowledge Base...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>Example queries:</span>
          </span>
          {EXAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-full whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type clinical inquiry, drug interaction, dosage query, or instructions in Tamil..."
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {aiConfiguredError && (
        <div className="p-3 bg-amber-950/50 border border-amber-600/40 rounded-xl text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>AI service not configured: To enable live Gemini LLM responses, set `GEMINI_API_KEY`.</span>
          </div>
          <button
            onClick={() => handleSend()}
            className="px-3 py-1 bg-amber-900/80 hover:bg-amber-800 text-amber-100 rounded text-xs font-medium flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
};
