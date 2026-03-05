import api from "./axios"; // Path to your axios.js file

export const processAICommand = async (prompt, history) => {
  try {
    // The base URL and Token are already handled by your axios.js
    const response = await api.post("/ai/process", { prompt, history });
    return response.data;
  } catch (error) {
    // Better error extraction for the UI
    throw error.response?.data?.message || "Something went wrong with the AI";
  }
};