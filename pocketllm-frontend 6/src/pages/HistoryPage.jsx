import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistoryPage.css';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/chat/threads');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId) => {
    try {
      const response = await axios.get(`/api/chat/threads/${sessionId}`);
      setSelectedSession(response.data);
    } catch (error) {
      console.error('Failed to load session details:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    alert('Delete functionality not available in this backend version.');
    // Backend doesn't support DELETE /api/chat/threads/{id}
  };

  const getFilteredSessions = () => {
    let filtered = sessions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.messages?.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Date filter
    const now = new Date();
    if (filterDate === 'today') {
      filtered = filtered.filter(s => {
        const sessionDate = new Date(s.created_at);
        return sessionDate.toDateString() === now.toDateString();
      });
    } else if (filterDate === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => new Date(s.created_at) >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => new Date(s.created_at) >= monthAgo);
    }

    return filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Conversation History</h2>
        <p className="subtitle">Browse and manage your past conversations</p>
      </div>

      <div className="history-content">
        <div className="sessions-panel">
          <div className="sessions-controls">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <select 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
              className="date-filter"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>

          <div className="sessions-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading conversations...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p>No conversations found</p>
              </div>
            ) : (
              filteredSessions.map(session => (
                <div
                  key={session.id}
                  className={`session-item ${selectedSession?.id === session.id ? 'active' : ''}`}
                  onClick={() => loadSessionDetails(session.id)}
                >
                  <div className="session-info">
                    <div className="session-title">
                      {session.title || `Conversation ${session.id.slice(0, 8)}`}
                    </div>
                    <div className="session-preview">
                      {session.messages?.[0]?.content.slice(0, 60)}...
                    </div>
                    <div className="session-meta">
                      <span className="session-date">{formatDate(session.updated_at)}</span>
                      <span className="session-count">{session.message_count} messages</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="details-panel">
          {!selectedSession ? (
            <div className="no-selection">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="13" y2="14" />
              </svg>
              <p>Select a conversation to view details</p>
            </div>
          ) : (
            <div className="session-details">
              <div className="details-header">
                <h3>{selectedSession.title || `Conversation ${selectedSession.id.slice(0, 8)}`}</h3>
                <div className="details-meta">
                  <span>Created: {new Date(selectedSession.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(selectedSession.updated_at).toLocaleString()}</span>
                  <span>Messages: {selectedSession.messages.length}</span>
                </div>
              </div>

              <div className="messages-container">
                {selectedSession.messages.map((message, idx) => (
                  <div key={idx} className={`message message-${message.role}`}>
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                      </span>
                      <span className="message-time">
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
