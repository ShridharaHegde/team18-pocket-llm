import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemma2:2b');
  const [availableModels, setAvailableModels] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await axios.get('/api/models');
      setAvailableModels(response.data || []);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get('/api/chat/threads');
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = async (threadId) => {
    try {
      const response = await axios.get(`/api/chat/threads/${threadId}`);
      // Backend returns thread object with messages
      const msgs = response.data.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at
      }));
      setMessages(msgs);
      setCurrentSession(threadId);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const createNewSession = () => {
    setMessages([]);
    setCurrentSession(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Backend expects: { prompt, thread_id?, model? }
      const response = await axios.post('/api/chat', {
        prompt: userMessage.content,
        thread_id: currentSession,
        model: selectedModel
      });

      // Backend returns: { response, thread_id }
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update current session if new
      if (!currentSession && response.data.thread_id) {
        setCurrentSession(response.data.thread_id);
        loadSessions(); // Refresh session list
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'error',
        content: error.response?.data?.detail || 'Failed to send message. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (threadId) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await axios.delete(`/api/chat/threads/${threadId}`);
      if (currentSession === threadId) {
        createNewSession();
      }
      loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Sessions</h3>
          <button onClick={createNewSession} className="new-session-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </div>
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">No conversations yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${currentSession === session.id ? 'active' : ''}`}
                onClick={() => loadSession(session.id)}
              >
                <div className="session-info">
                  <div className="session-title">
                    {session.title || `Session ${session.id.slice(0, 8)}`}
                  </div>
                  <div className="session-date">
                    {new Date(session.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="delete-session-button"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>Chat Interface</h2>
          {availableModels.length > 0 && (
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.name}>
                  {model.display_name || model.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>Start a conversation with the LLM</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => (
                <div key={index} className={`message message-${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'user' ? '👤' : message.role === 'error' ? '⚠️' : '🤖'}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? 'You' : message.role === 'error' ? 'Error' : 'Assistant'}
                      </span>
                      {message.timestamp && (
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <div className="message-text">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message message-assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-role">Assistant</span>
                    </div>
                    <div className="message-text">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="chat-input"
              rows={3}
              disabled={isLoading}
              maxLength={2048}
            />
            <div className="input-footer">
              <div className="char-count">
                {input.length} / 2048
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="send-button"
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
