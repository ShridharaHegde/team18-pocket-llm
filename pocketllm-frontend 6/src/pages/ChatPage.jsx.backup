import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
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
      setAvailableModels(response.data);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get('/api/threads');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const response = await axios.get(`/api/threads/${sessionId}/messages`);
      setMessages(response.data.messages || []);
      setCurrentSession(sessionId);
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

  const deleteSession = async (sessionId) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await axios.delete(`/api/threads/${sessionId}`);
      if (currentSession === sessionId) {
        createNewSession();
      }
      loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };
          ...prev,
          { role: 'error', content: data.message, timestamp: new Date() }
        ]);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const loadSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`);
      setMessages(response.data.messages);
      setCurrentSession(sessionId);
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
    
    if (!input.trim() || input.length > 2048) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Add placeholder for assistant response
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', timestamp: new Date(), streaming: true }
    ]);

    // Send via WebSocket
    const success = sendMessage({
      type: 'inference',
      prompt: input,
      temperature,
      max_tokens: maxTokens,
      session_id: currentSession
    });

    if (!success) {
      setIsStreaming(false);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'error', content: 'Failed to send message. WebSocket not connected.', timestamp: new Date() }
      ]);
    }
  };

  const charCount = input.length;
  const isValid = charCount > 0 && charCount <= 2048;

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Sessions</h3>
          <button onClick={createNewSession} className="new-session-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </div>
        <div className="sessions-list">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${currentSession === session.id ? 'active' : ''}`}
              onClick={() => loadSession(session.id)}
            >
              <div className="session-title">{session.title || 'Untitled Conversation'}</div>
              <div className="session-date">{new Date(session.updated_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>Chat Interface</h2>
          <div className="model-badge">Llama 3.2 3B</div>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Start a conversation</h3>
              <p>Ask me anything about your documents or just chat</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚠️'}
                </div>
                <div className="message-content">
                  <div className="message-meta">
                    <span className="message-role">{msg.role}</span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-text">
                    {msg.content}
                    {msg.streaming && <span className="cursor">▋</span>}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="parameters-bar">
            <div className="parameter">
              <label>Temperature: {temperature.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>
            <div className="parameter">
              <label>Max Tokens: {maxTokens}</label>
              <input
                type="range"
                min="1"
                max="2048"
                step="1"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="chat-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isStreaming}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="input-footer">
              <div className={`char-count ${!isValid ? 'invalid' : ''}`}>
                {charCount} / 2048
              </div>
              <button
                type="submit"
                disabled={!isValid || isStreaming}
                className="send-button"
              >
                {isStreaming ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
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
