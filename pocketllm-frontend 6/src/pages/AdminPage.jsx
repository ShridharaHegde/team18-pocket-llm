import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const { user, hasRole } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (hasRole('admin')) {
      loadMetrics();
      loadUsers();
    }
  }, [hasRole]);

  const loadMetrics = async () => {
    try {
      const response = await axios.get('/api/admin/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const clearCache = async () => {
    if (!confirm('Clear all system caches?')) return;
    try {
      await axios.post('/api/admin/cache/clear');
      alert('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  if (!hasRole('admin')) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>System Administration</h2>
        <p className="subtitle">Monitor and manage PocketLLM Portal</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Users
        </button>
        <button
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
          </svg>
          System
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            {loading ? (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading metrics...</p>
              </div>
            ) : (
              <>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon">👥</div>
                    <div className="metric-value">{metrics?.total_users || 0}</div>
                    <div className="metric-label">Total Users</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">💬</div>
                    <div className="metric-value">{metrics?.total_sessions || 0}</div>
                    <div className="metric-label">Total Sessions</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📝</div>
                    <div className="metric-value">{metrics?.total_messages || 0}</div>
                    <div className="metric-label">Total Messages</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📄</div>
                    <div className="metric-value">{metrics?.total_documents || 0}</div>
                    <div className="metric-label">Documents</div>
                  </div>
                </div>

                <div className="stats-section">
                  <div className="stats-card">
                    <h3>System Health</h3>
                    <div className="health-indicators">
                      <div className="health-item">
                        <span className="health-label">API Status</span>
                        <span className={`health-status ${metrics?.api_status === 'online' ? 'online' : 'offline'}`}>
                          {metrics?.api_status || 'Unknown'}
                        </span>
                      </div>
                      <div className="health-item">
                        <span className="health-label">Database</span>
                        <span className={`health-status ${metrics?.db_status === 'online' ? 'online' : 'offline'}`}>
                          {metrics?.db_status || 'Unknown'}
                        </span>
                      </div>
                      <div className="health-item">
                        <span className="health-label">Model Service</span>
                        <span className={`health-status ${metrics?.model_status === 'online' ? 'online' : 'offline'}`}>
                          {metrics?.model_status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-card">
                    <h3>Usage Statistics (Last 7 Days)</h3>
                    <div className="usage-stats">
                      <div className="stat-item">
                        <span className="stat-label">Active Users</span>
                        <span className="stat-value">{metrics?.active_users_7d || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">New Sessions</span>
                        <span className="stat-value">{metrics?.new_sessions_7d || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Avg Response Time</span>
                        <span className="stat-value">{metrics?.avg_response_time || 0}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="users-header">
              <h3>User Management</h3>
              <button className="create-user-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create User
              </button>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          {u.username}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className="role-select"
                          disabled={u.id === user.id}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="delete-user-button"
                          disabled={u.id === user.id}
                          title="Delete user"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-tab">
            <div className="system-section">
              <h3>System Controls</h3>
              <div className="controls-grid">
                <button onClick={clearCache} className="control-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Clear Cache
                </button>
                <button className="control-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Logs
                </button>
                <button className="control-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Backup Database
                </button>
                <button className="control-button danger">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear All Data
                </button>
              </div>
            </div>

            <div className="system-section">
              <h3>Configuration</h3>
              <div className="config-list">
                <div className="config-item">
                  <div className="config-info">
                    <div className="config-label">Model Name</div>
                    <div className="config-value">{metrics?.model_name || 'TinyLlama-1.1B'}</div>
                  </div>
                </div>
                <div className="config-item">
                  <div className="config-info">
                    <div className="config-label">Max Context Length</div>
                    <div className="config-value">{metrics?.max_context || '2048'} tokens</div>
                  </div>
                </div>
                <div className="config-item">
                  <div className="config-info">
                    <div className="config-label">Embedding Model</div>
                    <div className="config-value">{metrics?.embedding_model || 'sentence-transformers/all-MiniLM-L6-v2'}</div>
                  </div>
                </div>
                <div className="config-item">
                  <div className="config-info">
                    <div className="config-label">Vector Database</div>
                    <div className="config-value">{metrics?.vector_db || 'ChromaDB'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
