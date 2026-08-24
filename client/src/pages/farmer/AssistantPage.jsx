import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Sprout,
  HelpCircle,
  Radio,
  ArrowLeft
} from 'lucide-react';

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste Farmer! 🌾 I am FarmSetu Assistant. How can I help with your fields today?\n\nYou can ask about balanced fertilizer dosage, organic pest remedies, seasonal sowing calendars, or government schemes.',
      time: 'Just now',
      suggestions: [
        'What fertilizer is suitable for paddy?',
        'How to grow guava and control fruit fly?',
        'How to control stem borer in cotton?',
        'Tell me about PM-KISAN 17th installment',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recognition (Speech-to-Text)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query in the box below.');
      return;
    }

    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Spoken Voice Output)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (!text) {
      setIsSpeaking(false);
      return;
    }

    // Clean text: remove markdown symbols, bullets, numbers for natural spoken audio
    const cleanText = text
      .replace(/[*#_`~>|]/g, ' ')
      .replace(/[•\-\+]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // strip emojis for clear voice
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

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

  const handleSend = async (customQuery) => {
    const queryToSend = customQuery || inputText;
    if (!queryToSend.trim() || loading) return;

    // Stop previous voice output
    stopSpeaking();

    const userMessage = {
      sender: 'user',
      text: queryToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.post('/assistant/ask', { query: queryToSend });
      if (res.data.success) {
        const botMessage = {
          sender: 'bot',
          text: res.data.answer,
          topic: res.data.topic,
          suggestions: res.data.suggestions,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);

        // AUTOMATIC VOICE SPEAK-OUT: Speaks answer aloud automatically
        if (autoSpeak) {
          setTimeout(() => {
            speakText(res.data.answer);
          }, 200);
        }
      }
    } catch (err) {
      const fallbackText = '🌾 I could not connect to the advisory service. Please check your backend connection.';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (autoSpeak) {
        speakText(fallbackText);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Audio Controls & Back Navigation */}
      <div className="space-y-3">
        <Link
          to="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-emerald-400" />
              <span>FarmSetu AI Agricultural Assistant</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Voice-enabled advisor for crop protection, fertilizers, pest remedies, and government schemes.
            </p>
          </div>

          {/* Audio Output Settings */}
          <div className="flex items-center gap-2">
          {/* Toggle Auto-Speak */}
          <button
            type="button"
            onClick={() => {
              if (autoSpeak && isSpeaking) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              autoSpeak
                ? 'bg-forest-50 text-forest-800 border-forest-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Toggle automatic spoken voice answers"
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-forest-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>Auto-Voice: {autoSpeak ? 'ON' : 'Muted'}</span>
          </button>

          {/* Stop / Speak button */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 animate-pulse"
              title="Stop speaking"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Voice</span>
            </button>
          )}
        </div>
      </div>
    </div>

      {/* Main Chat Frame */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[650px]">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F9FAF9]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2.5 max-w-[85%]">
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 flex-shrink-0 mb-1 border border-forest-200 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                    msg.sender === 'user'
                      ? 'bg-forest-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 whitespace-pre-line'
                  }`}
                >
                  {msg.text}

                  {/* Manual read aloud button for past bot messages */}
                  {msg.sender === 'bot' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Read this answer aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-forest-700" />
                    </button>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>

              {/* Suggestions chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-full">
                  {msg.suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(suggestion)}
                      className="text-xs font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-200 px-3 py-1.5 rounded-full transition-all text-left"
                    >
                      ✨ {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-forest-700 text-xs py-3 px-4 bg-forest-50 rounded-2xl border border-forest-200 animate-pulse w-max">
              <Bot className="w-4 h-4" />
              <span>Analyzing agricultural knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={startListening}
              title={isListening ? 'Listening... Speak your question' : 'Speak Question'}
              className={`p-3 rounded-2xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200'
                  : 'bg-forest-50 hover:bg-forest-100 text-forest-700 border border-forest-200'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Text */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : 'Type or speak your agricultural question...'}
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 bg-forest-600 hover:bg-forest-700 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-all flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
