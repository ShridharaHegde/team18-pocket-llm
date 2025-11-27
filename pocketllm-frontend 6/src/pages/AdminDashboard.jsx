import React, { useState, useEffect } from 'react';
import './admindashboard.css';
import { Settings, Database, Users, Activity, BarChart3, Plus, Search, AlertCircle, CheckCircle, XCircle, RefreshCw, Shield, LogOut } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  // Data
  const [telemetry, setTelemetry] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [models, setModels] = useState([]);

  // Filters
  const [logFilter, setLogFilter] = useState({ action: '', limit: 50 });
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', display_name: '', provider: 'ollama' });

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        setIsLoggedIn(false);
        setToken('');
        localStorage.removeItem('admin_token');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      if (data.user.role !== 'admin') throw new Error('Admin role required');
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('admin_token');
  };

  // Fetch functions
  const fetchTelemetry = async () => { setLoading(true); try { setTelemetry(await apiCall('/api/admin/telemetry')); setError(''); } catch(err){ setError(err.message); } finally { setLoading(false); } };
  const fetchLogs = async () => { setLoading(true); try { const params = new URLSearchParams({ limit: logFilter.limit, ...(logFilter.action && { action: logFilter.action }) }); const data = await apiCall(`/api/admin/logs?${params}`); setLogs(data.logs || []); setError(''); } catch(err){ setError(err.message); } finally { setLoading(false); } };
  const fetchUsers = async () => { setLoading(true); try { setUsers(await apiCall('/api/admin/users')); setError(''); } catch(err){ setError(err.message); } finally { setLoading(false); } };
  const fetchModels = async () => { setLoading(true); try { setModels(await apiCall('/api/models')); setError(''); } catch(err){ setError(err.message); } finally { setLoading(false); } };

  // Update user
  const updateUserRole = async (userId, newRole) => { try { await apiCall(`/api/admin/users/${userId}/role`, { method:'PUT', body: JSON.stringify({ role:newRole }) }); fetchUsers(); } catch(err){ setError(err.message); } };
  const updateUserStatus = async (userId, isActive) => { try { await apiCall(`/api/admin/users/${userId}/status`, { method:'PUT', body: JSON.stringify({ is_active:isActive }) }); fetchUsers(); } catch(err){ setError(err.message); } };

  // Models
  const handleAddModel = async (e) => { e.preventDefault(); try { await apiCall('/api/admin/models', { method:'POST', body: JSON.stringify(newModel) }); setShowAddModel(false); setNewModel({ name:'', display_name:'', provider:'ollama' }); fetchModels(); } catch(err){ setError(err.message); } };
  const toggleModelStatus = async (modelId, currentStatus) => { try { await apiCall(`/api/admin/models/${modelId}`, { method:'PUT', body: JSON.stringify({ is_enabled: !currentStatus }) }); fetchModels(); } catch(err){ setError(err.message); } };

  useEffect(() => {
    if (!isLoggedIn) return;
    switch(activeTab){
      case 'telemetry': fetchTelemetry(); break;
      case 'logs': fetchLogs(); break;
      case 'users': fetchUsers(); break;
      case 'models': fetchModels(); break;
    }
  }, [activeTab, isLoggedIn]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login screen
  if(!isLoggedIn) return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-box">
        <Shield className="login-icon" />
        <h1>Admin Login</h1>
        {error && <div className="error-box">{error}</div>}
        <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">{loading ? 'Logging in...':'Login'}</button>
      </form>
    </div>
  );

  // Main dashboard
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo"><Database /> Pocket LLM Admin</div>
        <button className="logout-btn" onClick={handleLogout}><LogOut /> Logout</button>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          {[
            {id:'telemetry', icon: BarChart3, label:'Telemetry'},
            {id:'logs', icon: Activity, label:'System Logs'},
            {id:'users', icon: Users, label:'User Management'},
            {id:'models', icon: Settings, label:'Model Management'}
          ].map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab===tab.id?'active':''}`} onClick={()=>setActiveTab(tab.id)}>
              <tab.icon /> {tab.label}
            </button>
          ))}
        </aside>

        <main className="main-content">
          {error && <div className="error-box">{error}</div>}

          {/* Telemetry */}
{activeTab === 'telemetry' && telemetry && (
  <div className="table-container">
    <h2>System Telemetry</h2>
    <table className="telemetry-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th className="value-cell">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(telemetry).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td className="value-cell">{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <button className="refresh-btn" onClick={fetchTelemetry}>
      <RefreshCw /> Refresh
    </button>
  </div>
)}


          {/* Logs */}
          {activeTab==='logs' && (
            <div className="table-container">
              <h2>System Logs</h2>
              <div className="logs-filter">
                <select value={logFilter.action} onChange={e=>setLogFilter({...logFilter, action:e.target.value})}>
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="chat_request">Chat Request</option>
                  <option value="user_registered">User Registered</option>
                </select>
                <button className="refresh-btn" onClick={fetchLogs}><RefreshCw /> Search</button>
              </div>
              <div className="scrollable-table">
                <table>
                  <thead>
                    <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Endpoint</th><th>Status</th><th>IP</th></tr>
                  </thead>
                  <tbody>
                    {logs.map(log=>(
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td>{log.username||'N/A'}</td>
                        <td>{log.action}</td>
                        <td>{log.endpoint||'N/A'}</td>
                        <td>{log.status_code||'N/A'}</td>
                        <td>{log.ip_address||'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab==='users' && (
            <div>
              <h2>User Management</h2>
              <input type="text" placeholder="Search users..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="search-input"/>
              <div className="scrollable-table">
                <table>
                  <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(user=>(
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <select value={user.role} onChange={e=>updateUserRole(user.id,e.target.value)}>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                        </td>
                        <td>{user.is_active?'Active':'Inactive'}</td>
                        <td>
                          <button className="button-secondary" onClick={()=>updateUserStatus(user.id,!user.is_active)}>
                            {user.is_active?'Deactivate':'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Models */}
          {activeTab==='models' && (
            <div>
              <h2>Model Management</h2>
              <div className="models-header">
                <button className="add-btn" onClick={()=>setShowAddModel(true)}><Plus /> Add Model</button>
                <button className="refresh-btn" onClick={fetchModels}><RefreshCw /> Refresh</button>
              </div>
              <div className="scrollable-table">
                <table>
                  <thead><tr><th>Name</th><th>Display Name</th><th>Provider</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {models.map(model=>(
                      <tr key={model.id}>
                        <td>{model.name}</td>
                        <td>{model.display_name}</td>
                        <td>{model.provider}</td>
                        <td>{model.is_enabled?'Enabled':'Disabled'}</td>
                        <td>
                          <button className={model.is_enabled?'button-danger':'button-success'} onClick={()=>toggleModelStatus(model.id, model.is_enabled)}>
                            {model.is_enabled?'Disable':'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddModel && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Add New Model</h3>
                    <form onSubmit={handleAddModel}>
                      <input type="text" placeholder="Model Name" value={newModel.name} onChange={e=>setNewModel({...newModel,name:e.target.value})} required/>
                      <input type="text" placeholder="Display Name" value={newModel.display_name} onChange={e=>setNewModel({...newModel,display_name:e.target.value})}/>
                      <select value={newModel.provider} onChange={e=>setNewModel({...newModel,provider:e.target.value})}>
                        <option value="ollama">Ollama</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                      </select>
                      <div className="modal-actions">
                        <button type="submit" className="button-success">Add Model</button>
                        <button type="button" className="button-secondary" onClick={()=>setShowAddModel(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

