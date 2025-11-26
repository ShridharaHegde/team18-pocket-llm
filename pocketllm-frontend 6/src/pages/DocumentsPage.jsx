import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import axios from 'axios';
import './DocumentsPage.css';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    loadDocuments();

    // Subscribe to document processing updates
    const unsubscribe = subscribe((data) => {
      if (data.type === 'document_status') {
        setUploadStatus(data.status);
        if (data.status === 'complete') {
          loadDocuments();
          setUploading(false);
          setUploadProgress(0);
        }
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const loadDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, TXT, or DOCX files.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size is 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      // WebSocket will handle status updates
      setUploadStatus('Processing...');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed');
      setUploading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/documents/query', {
        query,
        top_k: 3
      });
      setResults(response.data);
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`/api/documents/${docId}`);
      loadDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <h2>Document Management</h2>
        <p className="subtitle">Upload documents for RAG-powered queries</p>
      </div>

      <div className="documents-content">
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-icon">📄</div>
            <h3>Upload Document</h3>
            <p>PDF, TXT, or DOCX • Max 10MB</p>

            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                accept=".pdf,.txt,.docx"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label htmlFor="file-input" className="file-input-label">
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
            </div>

            {selectedFile && !uploading && (
              <button onClick={handleUpload} className="upload-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload
              </button>
            )}

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="progress-status">
                  <span>{uploadProgress}%</span>
                  <span className="status-text">{uploadStatus}</span>
                </div>
              </div>
            )}
          </div>

          <div className="documents-list">
            <h3>Uploaded Documents</h3>
            {documents.length === 0 ? (
              <div className="empty-state">
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="document-items">
                {documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="doc-icon">
                      {doc.type === 'pdf' ? '📕' : doc.type === 'docx' ? '📘' : '📄'}
                    </div>
                    <div className="doc-info">
                      <div className="doc-name">{doc.filename}</div>
                      <div className="doc-meta">
                        {(doc.size / 1024).toFixed(1)} KB • {doc.chunks} chunks
                      </div>
                      <div className="doc-date">
                        {new Date(doc.uploaded_at).toLocaleString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="delete-button"
                      title="Delete document"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="query-section">
          <div className="query-card">
            <h3>Query Documents (RAG)</h3>
            <p>Ask questions about your uploaded documents</p>

            <form onSubmit={handleQuery} className="query-form">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to know about your documents?"
                className="query-input"
                rows={4}
                disabled={loading || documents.length === 0}
              />
              <button 
                type="submit" 
                disabled={!query.trim() || loading || documents.length === 0}
                className="query-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Query Documents
                  </>
                )}
              </button>
            </form>

            {results && (
              <div className="results-section">
                <h4>Results</h4>
                <div className="answer-box">
                  <div className="answer-label">Answer:</div>
                  <div className="answer-text">{results.answer}</div>
                </div>

                {results.sources && results.sources.length > 0 && (
                  <div className="sources-box">
                    <div className="sources-label">Relevant Chunks:</div>
                    {results.sources.map((source, idx) => (
                      <div key={idx} className="source-item">
                        <div className="source-header">
                          <span className="source-doc">{source.document}</span>
                          <span className="source-score">
                            Similarity: {(source.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="source-text">{source.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
