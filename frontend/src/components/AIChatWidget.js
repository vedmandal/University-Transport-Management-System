import React, { useState, useRef, useEffect, useContext } from 'react';
import { useAI } from '../context/AIContext';
import { AuthContext } from '../context/AuthContext';
import { 
  MessageSquare, X, Send, Bot, User, Volume2, 
  VolumeX, Mic, Square, ShieldCheck, Truck, Users 
} from 'lucide-react'; 
import './AIChatWidget.css';

const AIChatWidget = () => {
  const { role, user } = useContext(AuthContext);
  const { messages, askAI, loading } = useAI();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 
  
  const chatEndRef = useRef(null);

  // --- 0. ROLE-BASED UI CONFIGURATION ---
  const getRoleConfig = () => {
    const userRole = role?.toLowerCase() || 'student';
    const configs = {
      admin: {
        label: "Admin Copilot",
        color: "#dc2626",
        icon: <ShieldCheck size={18} />,
        welcome: `नमस्ते Admin ${user?.name || ''}! How can I help with fleet management?`
      },
      driver: {
        label: "Driver Assistant",
        color: "#16a34a",
        icon: <Truck size={18} />,
        welcome: "नमस्ते! Today's manifest is ready. Ask me to see your passenger list."
      },
      parent: {
        label: "Parent Support",
        color: "#ea580c",
        icon: <Users size={18} />,
        welcome: "नमस्ते! I can help you track your child's bus or change your password."
      },
      student: {
        label: "Student Helper",
        color: "#2563eb",
        icon: <Bot size={18} />,
        welcome: "नमस्ते! Which seat would you like to book today?"
      }
    };
    return configs[userRole] || configs.student;
  };

  const config = getRoleConfig();

  // --- 1. VOICE OUTPUT (TTS) ---
  const speakResponse = (text) => {
    if (!('speechSynthesis' in window) || isMuted) return;
    
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    
    // Voice Loading Retry Logic
    if (voices.length === 0) {
      setTimeout(() => speakResponse(text), 200);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text); 

    if (isHindi) {
      utterance.voice = voices.find(v => v.lang.includes('hi-IN')) || voices.find(v => v.lang.includes('hi')) || voices[0];
      utterance.lang = 'hi-IN';
    } else {
      utterance.voice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-GB')) || voices[0];
      utterance.lang = 'en-IN';
    }

    utterance.rate = 1.0; 
    utterance.pitch = 1.1; // Friendlier tone
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // --- 2. VOICE INPUT (STT) WITH AUTO-SUBMIT & INTERRUPTION ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser not supported. Please use Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; 
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      // 🛑 CRITICAL: AI stops talking immediately when user wants to speak
      stopSpeaking(); 
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);

      // 🚀 AUTO-SUBMIT: Triggers Gemini as soon as voice is processed
      if (transcript.trim()) {
        askAI(transcript);
        setInput(""); 
      }
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // --- 3. EFFECTS ---

  // Voice Initialization
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    // Wake-up nudge
    if ('speechSynthesis' in window) {
      const nudge = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(nudge);
      window.speechSynthesis.cancel();
    }
  }, []);

  // 🚀 AUTO-SPEAK: Seamless Voice-to-Voice Loop
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only speak if it's the AI and the mic isn't currently listening
      if (lastMessage.role === 'ai' && !isMuted && !isListening) {
        speakResponse(lastMessage.text);
      }
    }
  }, [messages, loading, isListening]);

  // Scroll to bottom
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
    <div className={`ai-widget-wrapper role-${role?.toLowerCase()}`}>
      {isOpen && (
        <div className="ai-phone-window shadow-2xl">
          <div className="ai-phone-header" style={{ backgroundColor: config.color }}>
            <div className="header-info">
              <div className="online-indicator"></div>
              <span className="flex items-center gap-2 font-medium">
                {config.icon} {config.label}
              </span>
            </div>
            <div className="header-actions">
               {isSpeaking && (
                 <button onClick={stopSpeaking} className="stop-btn pulse-animation">
                   <Square size={14} fill="white" />
                 </button>
               )}
               <button onClick={() => setIsMuted(!isMuted)} className="icon-btn">
                 {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
               </button>
               <X size={20} onClick={() => setIsOpen(false)} className="close-icon cursor-pointer" />
            </div>
          </div>
          
          <div className="ai-messages-container">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <div className="bot-icon-wrapper" style={{ color: config.color }}>
                   {config.icon}
                </div>
                <p className="text-center px-4 text-gray-600 font-medium">{config.welcome}</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`message-wrapper ${m.role}`}>
                <div 
                  className="avatar shadow-sm" 
                  style={{ backgroundColor: m.role === 'ai' ? config.color : '#4b5563' }}
                >
                  {m.role === 'ai' ? config.icon : <User size={14} />}
                </div>
                <div className="ai-bubble shadow-sm">{m.text}</div>
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
              style={{ color: isListening ? '#fff' : config.color }}
            >
              <Mic size={20} />
            </button>

            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak or type..."
              disabled={loading}
              className="outline-none"
            />
            
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              style={{ color: config.color }}
              className="send-btn"
            >
              <Send size={18}/>
            </button>
          </form>
        </div>
      )}

      <button 
        className={`ai-fab-button shadow-lg ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: config.color }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default AIChatWidget;