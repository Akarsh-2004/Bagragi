import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Bot, User, Loader2 } from "lucide-react";
import axios from "axios";

const PYTHON_API_URL = "https://bagragi-python-latest.onrender.com";
const NODE_API_URL = "https://bagragi-node-latest.onrender.com";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your travel assistant. I can help you plan trips, find hotels, explore destinations, and answer any travel-related questions. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleChatbot = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${PYTHON_API_URL}/api/chat`, {
        message: inputMessage,
      });

      const botReply = {
        id: messages.length + 2,
        text: response.data.reply || "Sorry, I didn't understand that.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botReply]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: messages.length + 2,
          text: "Sorry, there was an error contacting the assistant.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={handleToggleChatbot}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[32rem] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 text-white p-4">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">Travel Assistant</span>
            </div>
            <button onClick={handleToggleChatbot} aria-label="Close chatbot">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow ${
                    msg.sender === "user"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm shadow flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
