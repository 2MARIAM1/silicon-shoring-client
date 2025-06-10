import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ToastContainer } from 'react-toastify';
import { uploadFileToQdrant } from "../services/UploadService";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];

const MAX_FILES = 5;

const UploadScreen = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadResults, setUploadResults] = useState([]);
    const [uploadHistory, setUploadHistory] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('uploadHistory');
        if (saved) setUploadHistory(JSON.parse(saved));
    }, []);

    const validateFiles = (newFiles) => {
        const totalFiles = files.length + newFiles.length;
        if (totalFiles > MAX_FILES) {
            Swal.fire('Too Many Files', `You can upload a maximum of ${MAX_FILES} files.`, 'warning');
            return false;
        }

        const validFiles = newFiles.filter(file => ACCEPTED_TYPES.includes(file.type));
        if (validFiles.length !== newFiles.length) {
            Swal.fire('Invalid Files', 'Only PDF, DOC, DOCX, and TXT files are allowed.', 'error');
            return false;
        }

        return true;
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (validateFiles(selected)) {
            setFiles(prev => [...prev, ...selected]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const dropped = Array.from(e.dataTransfer.files);
        if (validateFiles(dropped)) {
            setFiles(prev => [...prev, ...dropped]);
        }
    };

    const handleUpload = async () => {
        setLoading(true);
        const results = [];

        for (const file of files) {
            try {
                const res = await uploadFileToQdrant(file, (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                });

                results.push({
                    name: file.name,
                    status: 'success',
                    chunks: res.chunks,
                    validation: res.validation,
                    time: new Date().toLocaleString()
                });
            } catch (error) {
                results.push({
                    name: file.name,
                    status: 'error',
                    errorMessage: error?.response?.data?.detail || error.message || "Unknown error",
                    time: new Date().toLocaleString()
                });
            }
        }

        setUploadResults(results);
        const updatedHistory = [...results, ...uploadHistory];
        setUploadHistory(updatedHistory);
        localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory));
        setFiles([]);
        setUploadProgress({});
        setLoading(false);

        const failed = results.filter(r => r.status === 'error');
        if (failed.length === 0) {
            Swal.fire('✅ Upload Complete', 'All files uploaded successfully.', 'success');
        } else {
            const errorList = failed.map(f => `<li><b>${f.name}</b>: ${f.errorMessage}</li>`).join('');
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                html: `<ul style="text-align: left; padding-left: 1.2em;">${errorList}</ul>`,
                width: '40em'
            });
        }
    };

    return (
        <div id="wrapper">
            <Sidebar />

            <div id="content-wrapper" className="d-flex flex-column" style={{ width: '100%' }}>
                <div id="content">
                    <Header /> {/* ✅ SB Admin 2 Topbar Header */}

                    <div className="container-fluid py-4">
                        <h2 className="mb-4">Upload Files (PDF, DOC, DOCX, TXT)</h2>
                        <p className="text-muted">Maximum of 5 files allowed per upload.</p>

                        <div className="form-group">
                            <label>Select files:</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                multiple
                                className="form-control"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border rounded p-4 text-center mt-3 bg-white"
                            style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        >
                            <p className="text-muted m-0">Or drag and drop files here</p>
                        </div>

                        <button
                            className="btn btn-primary mt-3"
                            onClick={handleUpload}
                            disabled={loading || files.length === 0}
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>

                        {files.length > 0 && (
                            <div className="mt-4">
                                <h6>📄 Selected Files</h6>
                                <ul className="list-group">
                                    {files.map((file, index) => (
                                        <li key={index} className="list-group-item d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>{file.name}</span>
                                                {uploadProgress[file.name] !== undefined && (
                                                    <div className="progress w-50">
                                                        <div
                                                            className="progress-bar"
                                                            role="progressbar"
                                                            style={{ width: `${uploadProgress[file.name]}%` }}
                                                        >
                                                            {uploadProgress[file.name]}%
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {uploadResults.length > 0 && (
                            <div className="mt-5">
                                <h6>📤 Upload Results</h6>
                                <ul className="list-group">
                                    {uploadResults.map((file, index) => (
                                        <li key={index} className="list-group-item d-flex flex-column">
                                            <div className="d-flex justify-content-between">
                                                <strong>{file.name}</strong>
                                                <span className={`badge badge-pill ${file.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                          {file.status === 'success' ? '✅ Uploaded' : '❌ Failed'}
                        </span>
                                            </div>
                                            {file.status === 'success' && (
                                                <small className="text-muted mt-1">Chunks: {file.chunks}, Validation: {file.validation}</small>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {uploadHistory.length > 0 && (
                            <div className="mt-5">
                                <h6>🕘 Upload History</h6>
                                <ul className="list-group">
                                    {uploadHistory.map((entry, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{entry.name}</strong><br />
                                                <small className="text-muted">{entry.time}</small>
                                            </div>
                                            <span className={`badge badge-pill ${entry.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {entry.status === 'success' ? '✅ Success' : '❌ Failed'}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={4000} />
        </div>
    );
};

export default UploadScreen;
