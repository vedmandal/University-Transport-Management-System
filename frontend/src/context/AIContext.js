import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext"; // Import your AuthContext
import { processAICommand } from "../api/ai";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const { token } = useContext(AuthContext); // Get the token status
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 🔄 THE AUTO-WIPE WATCHER ---
  // Whenever the token becomes null (Logout), clear the AI history automatically
  useEffect(() => {
    if (!token) {
      setMessages([]);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop AI from talking after logout
      }
      console.log("AI History Cleared automatically on Logout");
    }
  }, [token]);

  const askAI = async (prompt) => {
    // Optimistic UI update
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setLoading(true);
    
    const formattedHistory = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    try {
      const data = await processAICommand(prompt, formattedHistory);
      setMessages(prev => [...prev, { role: 'ai', text: data.message }]);
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