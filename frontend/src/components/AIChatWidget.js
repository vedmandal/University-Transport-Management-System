import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'; // Added icons for bubbles
import './AIChatWidget.css';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, askAI, loading } = useAI();
  const chatEndRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    askAI(input);
    setInput("");
  };

  return (
    <div className="ai-widget-wrapper">
      {isOpen && (
        <div className="ai-phone-window">
          {/* Header */}
          <div className="ai-phone-header">
            <div className="header-info">
              <div className="online-indicator"></div>
              <span>KRMU Fleet Assistant</span>
            </div>
            <X size={20} onClick={() => setIsOpen(false)} className="close-icon" />
          </div>
          
          {/* Messages Area */}
          <div className="ai-messages-container">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <Bot size={40} />
                <p>How can I help you manage the fleet today?</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`message-wrapper ${m.role}`}>
                <div className="avatar">
                  {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="ai-bubble">
                  {m.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message-wrapper ai">
                <div className="avatar animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="ai-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form className="ai-input-area" onSubmit={handleSend}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about buses, routes, or students..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18}/>
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        className={`ai-fab-button ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default AIChatWidget;