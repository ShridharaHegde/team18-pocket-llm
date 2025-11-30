import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "./developerDashboard.css";
import { Key, Plus, Trash2, RefreshCcw, Shield } from "lucide-react";

const DeveloperDashboard = () => {
    const { user } = useAuth();

    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/developer/api-keys");

            // Ensure res.data.keys exists and is an array
            if (res.data && Array.isArray(res.data.keys)) {
                setApiKeys(res.data.keys);
            } else {
                setApiKeys([]);  // fallback to empty array
            }

            setError("");
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
            setApiKeys([]); // fallback to empty array on error
        } finally {
            setLoading(false);
        }
    };


    const [newKeyName, setNewKeyName] = useState(""); // add state for key name

    const createKey = async () => {
        if (!newKeyName) {
            setError("API Key name is required");
            return;
        }

        try {
            await axios.post("/api/developer/api-keys", { name: newKeyName }); // send body
            setNewKeyName(""); // clear input
            fetchKeys();
            setError("");
        } catch (err) {
            const errData = err.response?.data?.detail || err.message;
            setError(typeof errData === "string" ? errData : JSON.stringify(errData, null, 2));
        }
    };



    const deleteKey = async (keyId) => {
        try {
            await axios.delete(`/api/developer/api-keys/${keyId}`);
            fetchKeys();
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        }
    };

    useEffect(() => {
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
                    <h2>Your API Keys</h2>
                    <div className="dev-buttons">
                        <button className="dev-btn success" onClick={createKey}>
                            <Plus /> Create API Key
                        </button>

                        <button className="dev-btn refresh" onClick={fetchKeys}>
                            <RefreshCcw /> Refresh
                        </button>
                    </div>

                    <table className="dev-table">
                        <thead>
                            <tr>
                                <th>Key ID</th>
                                <th>API Key</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiKeys.map((k) => (
                                <tr key={k.id}>
                                    <td>{k.id}</td>
                                    <td>{k.key}</td>
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

                    {apiKeys.length === 0 && (
                        <p className="no-keys">No API Keys Found</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DeveloperDashboard;
