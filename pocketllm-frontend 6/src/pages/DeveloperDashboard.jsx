import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "./DeveloperDashboard.css";
import { Key, Plus, Trash2, RefreshCcw, Shield } from "lucide-react";

const DeveloperDashboard = () => {
    const { user } = useAuth();

    const [apiKeys, setApiKeys] = useState([]);
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newKeyName, setNewKeyName] = useState("");
    const [selectedModelId, setSelectedModelId] = useState("");

    // Require developer role
    if (!user || user.role !== "developer") {
        return (
            <div className="dev-access-denied">
                <Shield size={64} />
                <h2>Access Denied</h2>
                <p>You must be a developer to access this page.</p>
            </div>
        );
    }

    const fetchModels = async () => {
        try {
            const res = await axios.get("/api/models");
            if (res.data && Array.isArray(res.data)) {
                setModels(res.data);
                // Auto-select first model if available
                if (res.data.length > 0 && !selectedModelId) {
                    setSelectedModelId(res.data[0].id);
                }
            }
        } catch (err) {
            console.error("Error fetching models:", err);
        }
    };

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/developer/api-keys");

            // Backend returns array directly, not wrapped in { keys: [...] }
            if (res.data && Array.isArray(res.data)) {
                setApiKeys(res.data);
            } else {
                setApiKeys([]);
            }

            setError("");
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
            setApiKeys([]);
        } finally {
            setLoading(false);
        }
    };

    const createKey = async () => {
        // Clear any previous errors
        setError("");

        if (!selectedModelId) {
            setError("Please select a model");
            return;
        }

        try {
            await axios.post("/api/developer/api-keys", { model_id: selectedModelId });
            setNewKeyName("");
            setSelectedModelId(models.length > 0 ? models[0].id : "");
            fetchKeys();
            setError("");
        } catch (err) {
            const errData = err.response?.data?.detail || err.message;
            setError(typeof errData === "string" ? errData : JSON.stringify(errData, null, 2));
        }
    };

    const deleteKey = async (keyId) => {
        if (!window.confirm("Are you sure you want to delete this API key?")) {
            return;
        }

        try {
            await axios.delete(`/api/developer/api-keys/${keyId}`);
            fetchKeys();
            setError("");
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        }
    };

    useEffect(() => {
        fetchModels();
        fetchKeys();
    }, []);

    return (
        <div className="dev-dashboard-container">

            <header className="dev-dashboard-header">
                <div className="logo">
                    <Key /> Developer Dashboard
                </div>
                <div className="dev-user-badge">
                    Logged in as: <strong>{user.username}</strong> ({user.role})
                </div>
            </header>

            <main className="dev-main-content">
                {error && (
                    <div className="dev-error-box">
                        {typeof error === "string" ? error : JSON.stringify(error, null, 2)}
                    </div>
                )}

                <div className="dev-card">
                    <h2>Create New API Key</h2>
                    <div className="dev-create-form">
                        <div className="dev-form-group">
                            <label htmlFor="key-name">API Key Name (Optional)</label>
                            <input
                                id="key-name"
                                type="text"
                                className="dev-input"
                                placeholder="Enter a name for your API key (optional)"
                                value={newKeyName}
                                onChange={(e) => {
                                    setNewKeyName(e.target.value);
                                    // Clear error when user starts typing
                                    if (error) setError("");
                                }}
                            />
                        </div>
                        <div className="dev-form-group">
                            <label htmlFor="model-select">Model</label>
                            <select
                                id="model-select"
                                className="dev-select"
                                value={selectedModelId}
                                onChange={(e) => {
                                    setSelectedModelId(e.target.value);
                                    // Clear error when user selects a model
                                    if (error) setError("");
                                }}
                            >
                                {models.length === 0 ? (
                                    <option value="">Loading models...</option>
                                ) : (
                                    <>
                                        <option value="">Select a model</option>
                                        {models.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.display_name || model.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                        <button className="dev-btn success" onClick={createKey} disabled={loading}>
                            <Plus /> Create API Key
                        </button>
                    </div>
                </div>

                <div className="dev-card">
                    <div className="dev-card-header">
                        <h2>Your API Keys</h2>
                        <button className="dev-btn refresh" onClick={fetchKeys} disabled={loading}>
                            <RefreshCcw /> Refresh
                        </button>
                    </div>

                    {loading && apiKeys.length === 0 ? (
                        <p className="no-keys">Loading...</p>
                    ) : apiKeys.length === 0 ? (
                        <p className="no-keys">No API Keys Found</p>
                    ) : (
                        <table className="dev-table">
                            <thead>
                                <tr>
                                    <th>Key ID</th>
                                    <th>API Key</th>
                                    <th>Model</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiKeys.map((k) => (
                                    <tr key={k.id}>
                                        <td>{k.id}</td>
                                        <td className="dev-api-key-cell">
                                            <code>{k.key_value || k.key}</code>
                                        </td>
                                        <td>{k.model_name || "N/A"}</td>
                                        <td>{new Date(k.created_at).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="dev-btn danger"
                                                onClick={() => deleteKey(k.id)}
                                            >
                                                <Trash2 /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DeveloperDashboard;
