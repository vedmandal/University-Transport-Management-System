import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext"; 
import { processAICommand } from "../api/ai";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const { token } = useContext(AuthContext); 

  // --- 1. INITIALIZE FROM STORAGE ---
  // When the app loads, check if there is a saved chat in the browser
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem("ai_chat_history");
    return savedChat ? JSON.parse(savedChat) : [];
  });

  const [loading, setLoading] = useState(false);

  // --- 2. THE PERSISTENCE WATCHER ---
  // Every time a new message is added, save the whole list to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // --- 3. THE AUTO-WIPE WATCHER (Logout) ---
  useEffect(() => {
    if (!token) {
      setMessages([]);
      localStorage.removeItem("ai_chat_history"); // Clear physical storage
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
      }
      console.log("AI History & Storage Cleared on Logout");
    }
  }, [token]);

  const askAI = async (prompt) => {
    // Add user message to state
    const userMsg = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    
    // Prepare history for Gemini API
    const formattedHistory = [...messages, userMsg].map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    try {
      const data = await processAICommand(prompt, formattedHistory);
      const aiMsg = { role: 'ai', text: data.message };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message || err}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ messages, askAI, loading }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);