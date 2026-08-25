import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import { Bot, Mic, MicOff, Send, Volume2, VolumeX, X, Sparkles, User, RefreshCw } from 'lucide-react';

export default function VoiceAssistantWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! 🌾 I am FarmSetu Assistant. Ask me anything about fertilizers, crop diseases, seasonal planting, pesticide dosage, or government welfare schemes.',
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

  // Clean audio on close
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Voice Recognition (Speech-to-Text)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
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

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Spoken Audio Output)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (!text) {
      setIsSpeaking(false);
      return;
    }

    // Clean text: strip markdown symbols, tables, emojis for smooth audio
    const cleanText = text
      .replace(/[*#_`~>|]/g, ' ')
      .replace(/[•\-\+]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
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

        // AUTOMATIC VOICE SPEAK-OUT: Speaks answer aloud immediately
        if (autoSpeak) {
          setTimeout(() => {
            speakText(res.data.answer);
          }, 200);
        }
      }
    } catch (err) {
      const fallbackText = '🌾 I could not connect to the knowledge service. Please try again.';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] h-full sm:h-[600px] z-50 bg-[#06151a] sm:rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-[#06151a] border-b border-slate-700 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#030b0e] flex items-center justify-center border border-slate-700 text-teal-400">
            <Bot className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              FarmSetu AI Voice Assistant
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
              </span>
            </h3>
            <p className="text-[11px] text-teal-300 font-medium">
              {isSpeaking ? '🔊 Speaking answer aloud...' : 'Voice & Agricultural Advisor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle Auto-Voice */}
          <button
            type="button"
            onClick={() => {
              if (autoSpeak && isSpeaking) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            title={autoSpeak ? 'Auto-Voice is ON' : 'Auto-Voice is Muted'}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#0c242c] transition-colors cursor-pointer"
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              title="Stop speech"
              className="p-2 text-amber-400 hover:text-white rounded-xl hover:bg-[#0c242c] transition-colors animate-pulse cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#0c242c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#030b0e]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-[#06151a] flex items-center justify-center text-teal-400 flex-shrink-0 mb-1 border border-slate-700">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                  msg.sender === 'user'
                    ? 'btn-glow-primary text-slate-950 font-bold rounded-br-none'
                    : 'bg-[#06151a] text-white rounded-bl-none border border-slate-700 whitespace-pre-line'
                }`}
              >
                {msg.text}

                {msg.sender === 'bot' && (
                  <button
                    type="button"
                    onClick={() => speakText(msg.text)}
                    className="absolute top-1.5 right-1.5 p-1 bg-[#030b0e] hover:bg-[#0c242c] text-teal-300 border border-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Read this aloud"
                  >
                    <Volume2 className="w-3 h-3 text-teal-400" />
                  </button>
                )}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>

            {/* Suggestions buttons */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-full">
                {msg.suggestions.map((suggestion, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSend(suggestion)}
                    className="text-[11px] font-medium text-teal-300 bg-[#06151a] hover:bg-[#0c242c] border border-slate-700 px-2.5 py-1 rounded-full transition-all text-left cursor-pointer"
                  >
                    ✨ {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-teal-300 text-xs py-2 bg-[#06151a] p-3 rounded-2xl border border-slate-700 animate-pulse w-max">
            <Bot className="w-4 h-4 text-teal-400" />
            <span>FarmSetu AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#06151a] border-t border-slate-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={startListening}
            title={isListening ? 'Listening... Speak your question' : 'Speak your question'}
            className={`p-2.5 rounded-2xl transition-all border border-slate-700 cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50'
                : 'bg-[#030b0e] hover:bg-[#0c242c] text-teal-300'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-teal-400" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to voice...' : 'Ask about crops, fertilizers, pests...'}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all placeholder:text-slate-500 font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 btn-glow-primary text-slate-950 font-black rounded-2xl shadow-sm transition-all flex-shrink-0 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-5 h-5 text-slate-950" />
          </button>
        </form>
      </div>
    </div>
  );
}
