import React, { useState, useRef, useEffect, useContext } from 'react';
import { useAI } from '../context/AIContext';
import { AuthContext } from '../context/AuthContext';
import { 
  MessageSquare, X, Send, Bot, User, Volume2, 
  VolumeX, Mic, Square, ShieldCheck, Truck, Users, 
  ChevronRight, Sparkles 
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
      admin: { label: "Admin Copilot", color: "#6366f1", icon: <ShieldCheck size={18} />, welcome: "Fleet Status is normal. How can I assist with management today?" },
      driver: { label: "Driver Assistant", color: "#10b981", icon: <Truck size={18} />, welcome: "Route 102 is active. Need passenger details or manifest info?" },
      parent: { label: "Parent Support", color: "#f59e0b", icon: <Users size={18} />, welcome: "Tracking active. Ask me for your child's bus location." },
      student: { label: "Student Helper", color: "#6366f1", icon: <Sparkles size={18} />, welcome: "Hi! Ready to book a seat or check your bus schedule?" }
    };
    return configs[userRole] || configs.student;
  };

  const config = getRoleConfig();

  // --- 1. VOICE OUTPUT (TTS) ---
  const speakResponse = (text) => {
    if (!('speechSynthesis' in window) || isMuted) return;
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      setTimeout(() => speakResponse(text), 200);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text); 

    if (isHindi) {
      utterance.voice = voices.find(v => v.lang.includes('hi-IN')) || voices[0];
      utterance.lang = 'hi-IN';
    } else {
      utterance.voice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-GB')) || voices[0];
      utterance.lang = 'en-IN';
    }

    utterance.rate = 1.0; 
    utterance.pitch = 1.05; 
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // --- 2. VOICE INPUT (STT) WITH AUTO-SUBMIT ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; 
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      stopSpeaking(); 
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
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
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'ai' && !isMuted && !isListening) {
        speakResponse(lastMessage.text);
      }
    }
  }, [messages, loading, isListening]);

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
    <div className="ai-dashboard-widget">
      {isOpen && (
        <div className="chat-panel shadow-dashboard">
          <div className="chat-header">
            <div className="header-status">
              <div className="status-dot"></div>
              <span className="role-label">{config.label}</span>
            </div>
            <div className="header-actions">
               {isSpeaking && (
                 <button onClick={stopSpeaking} className="speaker-wave-btn">
                   <div className="wave-icon"></div>
                   <Square size={12} fill="currentColor" />
                 </button>
               )}
               <button onClick={() => setIsMuted(!isMuted)} className="util-btn">
                 {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
               </button>
               <button onClick={() => setIsOpen(false)} className="util-btn">
                 <X size={18} />
               </button>
            </div>
          </div>
          
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="icon-circle" style={{ backgroundColor: config.color + '15', color: config.color }}>
                   {config.icon}
                </div>
                <h3>How can I help, {user?.name?.split(' ')[0] || 'Student'}?</h3>
                <p>{config.welcome}</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role}`}>
                <div className="msg-content">
                  <div className="msg-bubble">{m.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg-row ai">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-footer" onSubmit={handleSend}>
            <button 
              type="button" 
              onClick={startListening}
              className={`action-btn mic ${isListening ? 'active' : ''}`}
            >
              <Mic size={20} />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
            />
            <button type="submit" className="action-btn send" disabled={loading || !input.trim()}>
              <ChevronRight size={20}/>
            </button>
          </form>
        </div>
      )}

      <button 
        className={`fab-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: config.color }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default AIChatWidget;