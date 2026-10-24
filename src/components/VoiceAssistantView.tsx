import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Check, 
  Send, 
  Languages, 
  ShieldAlert, 
  Sparkles,
  Bot,
  User,
  AlertTriangle
} from 'lucide-react';
import { ActivePage } from '../types';

interface VoiceAssistantViewProps {
  setActivePage: (page: ActivePage) => void;
}

interface VoiceTurn {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  language: 'en' | 'ta';
  timestamp: string;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({ setActivePage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta'>('en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [turns, setTurns] = useState<VoiceTurn[]>([
    {
      id: 'turn-1',
      speaker: 'assistant',
      text: 'Medivexa Multilingual Voice Assistant ready. You can speak to me in English or Tamil (தமிழ்). How may I assist with your prescription or medicine verification?',
      language: 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechError('Web Speech API is not supported in this browser. You can type or use sample audio queries below.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';
          recognitionRef.current.start();
        } else {
          setSpeechError('Speech recognition not available on this browser.');
        }
      } catch (e: any) {
        console.warn(e);
      }
    }
  };

  // Speak response using SpeechSynthesis
  const speakText = (text: string, lang: 'en' | 'ta') => {
    if (!ttsEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendTranscript = async (customQuery?: string) => {
    const text = (customQuery || transcript).trim();
    if (!text || isProcessing) return;

    const userTurn: VoiceTurn = {
      id: `turn-${Date.now()}`,
      speaker: 'user',
      text,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTurns((prev) => [...prev, userTurn]);
    setTranscript('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          language: selectedLanguage,
          isVoice: true 
        })
      });

      let reply = '';
      if (!res.ok) {
        // Safe clinical fallback response
        if (selectedLanguage === 'ta') {
          reply = 'மருத்துவ வழிகாட்டுதல்: மருத்துவர் பரிந்துரைத்த வழிமுறைகளை கவனமாக பின்பற்றவும். ஏதேனும் முரண்பாடுகள் அல்லது ஒவ்வாமை இருந்தால் உடனடியாக உங்கள் மருந்தாளரிடம் உறுதிப்படுத்தவும்.';
        } else {
          reply = 'Clinical notice: Always take medications as prescribed with meals unless otherwise specified. For potential Look-Alike Sound-Alike medications, double check the active generic salt name on the label.';
        }
      } else {
        const data = await res.json();
        reply = data.reply || data.text;
      }

      const botTurn: VoiceTurn = {
        id: `turn-${Date.now() + 1}`,
        speaker: 'assistant',
        text: reply,
        language: selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTurns((prev) => [...prev, botTurn]);
      speakText(reply, selectedLanguage);
    } catch {
      const errReply = selectedLanguage === 'ta' 
        ? 'AI சேவை இணைக்கப்படவில்லை: சர்வரில் GEMINI_API_KEY உள்ளமைக்கப்பட்டுள்ளதை உறுதிப்படுத்தவும்.'
        : 'AI service not configured: Verify GEMINI_API_KEY is configured on the server to enable real-time speech responses.';
      
      const botTurn: VoiceTurn = {
        id: `turn-${Date.now() + 1}`,
        speaker: 'assistant',
        text: errReply,
        language: selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTurns((prev) => [...prev, botTurn]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleVoiceQueries = [
    { text: 'இந்த மாத்திரையை உணவுக்கு முன் உட்கொள்ள வேண்டுமா?', lang: 'ta', label: 'Tamil: Before/after food?' },
    { text: 'செலெக்ஸ் மற்றும் செலெப்ரெக்ஸ் இடையேயான வித்தியாசம் என்ன?', lang: 'ta', label: 'Tamil: Celebrex vs Celexa' },
    { text: 'Explain side effects of Metformin and when to call a doctor', lang: 'en', label: 'EN: Metformin Side Effects' },
    { text: 'Check interaction between Hydralazine and blood pressure pills', lang: 'en', label: 'EN: Hydralazine check' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Mic className="w-7 h-7 text-cyan-400" />
            <span>Multilingual Medical Voice Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Voice-enabled prescription verification and medication counseling in English and Tamil (தமிழ்).
          </p>
        </div>

        {/* Controls: Language and Speech Output */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <Languages className="w-4 h-4 text-cyan-400 ml-2" />
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLanguage === 'en'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('ta')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLanguage === 'ta'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>

          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setTtsEnabled(!ttsEnabled);
            }}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              ttsEnabled
                ? 'bg-slate-900 border-slate-700 text-cyan-400'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
            title={ttsEnabled ? 'Read replies aloud (Enabled)' : 'Read replies aloud (Muted)'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? 'Voice Output ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {speechError && (
        <div className="p-3 bg-amber-950/60 border border-amber-600/40 rounded-xl text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Main Voice Interaction Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Mic & Live Transcript Review */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-6 flex flex-col items-center justify-center min-h-[380px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Audio Channel ({selectedLanguage === 'ta' ? 'தமிழ்' : 'English'})
            </span>

            {/* Pulsing Mic Circle */}
            <div className="relative flex items-center justify-center">
              {isListening && (
                <div 
                  className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"
                  style={{ transform: 'scale(1.4)' }}
                />
              )}
              <button
                type="button"
                onClick={toggleListening}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isListening
                    ? 'bg-red-600 text-white shadow-red-600/50 scale-105'
                    : 'bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/60 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 animate-bounce" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                {isListening
                  ? selectedLanguage === 'ta' ? 'பேசுங்கள்... கேட்கிறது' : 'Listening... Speak now'
                  : selectedLanguage === 'ta' ? 'மைக் மீது கிளிக் செய்து பேசவும்' : 'Tap microphone to speak'}
              </p>
              <p className="text-xs text-slate-400">
                You can review and edit recognized speech before confirming
              </p>
            </div>

            {/* Recognized Speech Preview */}
            <div className="w-full text-left space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Recognized Transcript (Review before sending):
              </label>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  selectedLanguage === 'ta'
                    ? 'உங்கள் குரல் உரை இங்கே தோன்றும்...'
                    : 'Spoken transcript will appear here. You can also edit it...'
                }
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none font-sans"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  disabled={!transcript}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs rounded-lg"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleSendTranscript()}
                  disabled={!transcript.trim() || isProcessing}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-950"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Query</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Voice Prompt Cards */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sample Voice Prompts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleVoiceQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLanguage(q.lang as 'en' | 'ta');
                    handleSendTranscript(q.text);
                  }}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500 text-left text-xs transition-colors group"
                >
                  <div className="font-medium text-cyan-300 text-[11px] group-hover:text-cyan-200">
                    {q.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{q.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conversational Transcript History */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden min-h-[480px]">
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Voice Consultation Transcript
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400">
                {turns.length} turns
              </span>
            </div>
            {isSpeaking && (
              <span className="flex items-center gap-1.5 text-xs text-cyan-400 animate-pulse font-medium">
                <Volume2 className="w-3.5 h-3.5" /> Speaking Response...
              </span>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {turns.map((turn) => {
              const isUser = turn.speaker === 'user';
              return (
                <div
                  key={turn.id}
                  className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-cyan-600 text-white'
                        : 'bg-indigo-950 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm space-y-1.5 leading-relaxed ${
                      isUser
                        ? 'bg-cyan-900/50 border border-cyan-700/50 text-cyan-50 rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{turn.text}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{turn.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => speakText(turn.text, turn.language)}
                          className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-[11px]"
                          title="Play audio again"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Replay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Synthesizing clinical response...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
