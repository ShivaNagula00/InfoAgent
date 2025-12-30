import React, { useState, useEffect, useRef } from "react";
import { sendMessage } from "./api";
import { formatResponse, formatTextContent } from "./utils/formatResponse";
import "./index.css";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Component to render formatted bot responses
  const FormattedResponse = ({ text }) => {
    const formattedParts = formatResponse(text);
    
    return (
      <div className="formatted-response">
        {formattedParts.map((part) => {
          switch (part.type) {
            case 'heading':
              const HeadingTag = `h${Math.min((part.level || 1) + 1, 6)}`;
              return (
                <div key={part.key} className={`response-heading level-${(part.level || 1) + 1}`}>
                  {React.createElement(HeadingTag, { style: { margin: 0 } }, part.content)}
                </div>
              );
            case 'list-item':
              return (
                <div key={part.key} className="response-list-item">
                  <span className="list-bullet">•</span>
                  <span dangerouslySetInnerHTML={{ __html: formatTextContent(part.content.replace(/^[-*•]\s|^\d+\.\s/, '')) }} />
                </div>
              );
            case 'code':
              const codeContent = part.content.replace(/```/g, '');
              return (
                <div key={part.key} className="response-code-container">
                  <div className="code-header">
                    <span className="code-language">Code</span>
                    <button 
                      className="copy-button"
                      onClick={() => navigator.clipboard.writeText(codeContent)}
                      title="Copy code"
                    >
                      📋
                    </button>
                  </div>
                  <pre className="response-code">
                    <code>{codeContent}</code>
                  </pre>
                </div>
              );
            case 'paragraph':
            default:
              return (
                <p key={part.key} className="response-paragraph" 
                   dangerouslySetInnerHTML={{ __html: formatTextContent(part.content) }} />
              );
          }
        })}
      </div>
    );
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(scrollToBottom, [chat, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: "user", text: input.trim() };
    setChat(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(userMsg.text);
      const botMsg = { role: "assistant", text: res.response };
      setChat(prev => [...prev, botMsg]);
    } catch (err) {
      setChat(prev => [...prev, { 
        role: "assistant", 
        text: "I'm sorry, I'm having trouble connecting to my services right now. Please try again later." 
      }]);
    }

    setLoading(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="main-content">
      {chat.length > 0 && (
        <div className="chat-header">
          <h1 className="chat-title">InfoAgent</h1>
        </div>
      )}

      <div className="chat-messages">
        {chat.length === 0 ? (
          <div className="welcome-screen">
            <h1 className="welcome-title">InfoAgent</h1>
            <p className="welcome-subtitle">
              I'm your InfoAgent, ready to assist you with information and answer your questions. 
              How can I help you today?
            </p>
            <div className="example-grid">
              <div 
                className="example-card" 
                onClick={() => handleExampleClick("What's the weather like in New York?")}
              >
                <h3>🌤️ Weather Information</h3>
                <p>Get current weather conditions and forecasts for any city around the world</p>
              </div>
              <div 
                className="example-card" 
                onClick={() => handleExampleClick("Tell me about artificial intelligence")}
              >
                <h3>💡 General Knowledge</h3>
                <p>Ask questions about science, technology, history, and various topics</p>
              </div>
              <div 
                className="example-card" 
                onClick={() => handleExampleClick("How can you help me today?")}
              >
                <h3>🤖 Assistant Capabilities</h3>
                <p>Learn about my features and how I can assist you with different tasks</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chat.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className={`message-avatar ${message.role === "user" ? "user-avatar" : "assistant-avatar"}`}>
                  <span className="avatar-icon">{message.role === "user" ? "👤" : "🤖"}</span>
                </div>
                <div className="message-content">
                  {message.role === "assistant" ? (
                    <FormattedResponse text={message.text} />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="typing-indicator">
                <div className="message-avatar assistant-avatar"><span className="avatar-icon">🤖</span></div>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef}></div>
      </div>

      <div className="input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="message-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message InfoAgent..."
              rows={1}
              disabled={loading}
            />
            <button 
              className="send-button" 
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}