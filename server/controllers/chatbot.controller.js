// controllers/chatbot.controller.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithGemini = async (message) => {
  try {
    console.log('Initializing Gemini AI...');
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);
    
    // Create a model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log('Model created successfully');

    // Create a chat session with system prompt and sample turn
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are a helpful travel assistant for Bagragi, a travel platform. " +
                "You help users with trip planning, hotel recommendations, destination info, travel tips, and general travel questions. " +
                "Be friendly, concise, and practical in responses."
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text:
                "Hello! I'm your travel assistant for Bagragi. I can help you plan trips, find hotels, explore destinations, and answer any travel-related questions. " +
                "How can I assist you today?"
            }
          ]
        },
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    });

    console.log('Chat session started');
    console.log('Sending message to Gemini:', message);

    const result = await chat.sendMessage(message);
    const response = await result.response;
    console.log('Received response from Gemini');
    return response.text();

  } catch (error) {
    console.error('Gemini API error details:', error);
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        response: "I'm sorry, but I'm currently not available. Please try again later or contact support."
      });
    }

    const response = await chatWithGemini(message);

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
