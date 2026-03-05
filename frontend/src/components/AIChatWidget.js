import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { MessageSquare, X, Send, Bot, User, Volume2, VolumeX, Mic, Square } from 'lucide-react'; 
import './AIChatWidget.css';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if AI is currently talking
  const { messages, askAI, loading } = useAI();
  const chatEndRef = useRef(null);

  // --- 1. VOICE OUTPUT (TTS) ---
  const speakResponse = (text) => {
    if (!('speechSynthesis' in window) || isMuted) return;
    
    window.speechSynthesis.cancel();
    
    const isHindi = /[\u0900-\u097F]/.test(text); 
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (isHindi) {
      utterance.voice = voices.find(v => v.lang.includes('hi-IN')) || voices[0];
      utterance.lang = 'hi-IN';
    } else {
      utterance.voice = voices.find(v => v.lang.includes('en-IN')) || voices[0];
      utterance.lang = 'en-IN';
    }

    utterance.rate = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // --- 2. VOICE INPUT (STT) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser not supported. Use Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; 
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      stopSpeaking(); // Stop AI if user starts talking
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Initialization: Ensure voices are loaded into the browser memory
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Speak AI responses automatically when loading finishes
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'ai') {
        speakResponse(lastMessage.text);
      }
    }
  }, [messages, loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    stopSpeaking(); 
    askAI(input);
    setInput("");
  };

  return (
    <div className="ai-widget-wrapper">
      {isOpen && (
        <div className="ai-phone-window">
          <div className="ai-phone-header">
            <div className="header-info">
              <div className="online-indicator"></div>
              <span>KRMU Fleet Assistant</span>
            </div>
            <div className="header-actions">
               {/* Stop button appears only when AI is talking */}
               {isSpeaking && (
                 <button onClick={stopSpeaking} className="stop-btn" title="Stop AI Voice">
                   <Square size={16} fill="white" />
                 </button>
               )}
               <button onClick={() => setIsMuted(!isMuted)} className="icon-btn">
                 {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
               </button>
               <X size={20} onClick={() => setIsOpen(false)} className="close-icon" />
            </div>
          </div>
          
          <div className="ai-messages-container">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <Bot size={40} />
                <p>नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`message-wrapper ${m.role}`}>
                <div className="avatar">{m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}</div>
                <div className="ai-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper ai">
                <div className="ai-bubble typing">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="ai-input-area" onSubmit={handleSend}>
            <button 
              type="button" 
              onClick={startListening}
              className={`mic-btn ${isListening ? 'active-mic' : ''}`}
            >
              <Mic size={20} />
            </button>

            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak or type..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18}/>
            </button>
          </form>
        </div>
      )}

      <button className={`ai-fab-button ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default AIChatWidget;