// controllers/chatbot.controller.js
const { OpenAI } = require('openai');

// Initialize Groq AI using OpenAI-compatible client
const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
});

const chatWithGroq = async (message) => {
  try {
    console.log('Initializing Groq AI...');
    console.log('API Key available:', !!process.env.GROQ_API_KEY);

    const systemPrompt = 
      "You are a helpful travel assistant for Bagragi, a travel platform. " +
      "You help users with trip planning, hotel recommendations, destination info, travel tips, and general travel questions. " +
      "Be friendly, concise, and practical in responses.";

    console.log('Sending message to Groq:', message);

    const response = await openai.chat.completions.create({
      model: "llama3-70b-8192", // or "mixtral-8x7b-32768"
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Received response from Groq');
    return response.choices[0].message.content;

  } catch (error) {
    console.error('Groq API error details:', error);
    throw new Error(`Failed to get response from AI: ${error.message}`);
  }
};

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Groq API key not configured',
        response: "I'm sorry, but I'm currently not available. Please try again later or contact support."
      });
    }

    const response = await chatWithGroq(message);

    res.json({
      success: true,
      response,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    });
  }
};

module.exports = {
  handleChat
};
