import React, { createContext, useState, useContext } from "react";
import { processAICommand } from "../api/ai";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async (prompt) => {
    setLoading(true);
    
    // 1. Prepare history for Gemini API
    const formattedHistory = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    try {
      const data = await processAICommand(prompt, formattedHistory);
      
      // 2. Update messages with the real response from Render
      setMessages(prev => [
        ...prev, 
        { role: 'user', text: prompt }, 
        { role: 'ai', text: data.message }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err}` }]);
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