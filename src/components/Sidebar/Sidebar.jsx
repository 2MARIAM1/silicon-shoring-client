import './Sidebar.css';
import {useEffect, useState} from 'react';
import { toast } from 'react-toastify';
import { ingestRepository } from "../../services/GitIngestService";
import { uploadFileToQdrant } from "../../services/UploadService";

const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];
const MAX_FILES = 2;

const Sidebar = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [loadingRepo, setLoadingRepo] = useState(false);
    const [files, setFiles] = useState([]);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadHistory, setUploadHistory] = useState([]);
    const [lastIngestedRepo, setLastIngestedRepo] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('uploadHistory');
        if (saved) setUploadHistory(JSON.parse(saved));
    }, []);

    const handleRepoSubmit = async (e) => {
        e.preventDefault();
        if (!repoUrl.trim()) {
            toast.error("Please enter a GitHub repository URL");
            return;
        }

        setLoadingRepo(true);
        toast.info("📚 Ingesting repository... This may take a while.");

        // ⏱️ Set reminders
        let reminderInterval = null;
        const reminderTimeout = setTimeout(() => {
            reminderInterval = setInterval(() => {
                toast.info("⏳ Still ingesting... this operation can take a while.", { autoClose: 5000 });
            }, 15000);
        }, 30000);

        try {
            const data = await ingestRepository(repoUrl);
            toast.success(`Repository "${data.repo_name}" ingested successfully!`);
            setLastIngestedRepo(data);  // ✅ save result for UI
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error( "❌ Error ingesting repository");
            }
        } finally {  clearTimeout(reminderTimeout);
            if (reminderInterval) clearInterval(reminderInterval);
            setLoadingRepo(false);
        }
    };

    const validateFiles = (newFiles) => {
        const total = newFiles.length + files.length;
        if (total > MAX_FILES) {
            toast.warn(`Maximum ${MAX_FILES} files allowed.`);
            return false;
        }

        const valid = newFiles.filter(f => ACCEPTED_TYPES.includes(f.type));
        if (valid.length !== newFiles.length) {
            toast.error("Only PDF, DOC, DOCX, and TXT files are allowed.");
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

    const handleUpload = async () => {
        setLoadingUpload(true);
        const newHistory = [];

        for (const file of files) {
            const time = new Date().toLocaleString();
            try {
                const res = await uploadFileToQdrant(file, (event) => {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                });

                toast.success(` ${file.name} uploaded (${res.chunks} chunks)`);
                newHistory.push({ name: file.name, status: 'success', time });

            } catch (error) {
                toast.error(` ${file.name} failed: ${error?.response?.data?.detail || error.message}`);
                newHistory.push({ name: file.name, status: 'error', time });
            }
        }

        const updated = [...newHistory, ...uploadHistory].slice(0, 5); // keep latest 5
        setUploadHistory(updated);
        localStorage.setItem('uploadHistory', JSON.stringify(updated));

        setFiles([]);
        setUploadProgress({});
        setLoadingUpload(false);
    };

    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion custom-sidebar-wide" id="accordionSidebar">

            {/* Logo */}
            <div className="sidebar-brand d-flex align-items-center justify-content-center">
                <img src="/images/logo-wemanity-white.png" alt="Logo" style={{ width: '80%' }} />
            </div>

            <hr className="sidebar-divider" />

            {/* Upload Files */}
            <li className="nav-item px-3">
                <div className="text-white small mb-1">📁 Upload Files</div>
                <input
                    type="file"
                    multiple
                    className="form-control form-control-sm mb-2"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={loadingUpload}
                />
                {files.length > 0 && (
                    <div className="text-white small mb-2">
                        {files.map((f, i) => (
                            <div key={i}>
                                {f.name}
                                {uploadProgress[f.name] !== undefined && (
                                    <div className="progress mt-1">
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${uploadProgress[f.name]}%` }}
                                        >
                                            {uploadProgress[f.name]}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <button
                    className="btn btn-light btn-sm w-100"
                    onClick={handleUpload}
                    disabled={files.length === 0 || loadingUpload}
                >
                    {loadingUpload ? "Uploading..." : "Upload"}
                </button>
            </li>

            <hr className="sidebar-divider" />

            {/* GitHub Repo Input */}
            <li className="nav-item px-3">
                <form onSubmit={handleRepoSubmit}>
                    <div className="form-group">
                        <label htmlFor="repoInput" className="text-white small">🔗 GitHub Repository</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            id="repoInput"
                            placeholder="https://github.com/user/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            disabled={loadingRepo}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-light btn-sm mt-1 w-100"
                        disabled={loadingRepo}
                    >
                        {loadingRepo ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            "Ingest Repo"
                        )}
                    </button>
                    {uploadHistory.length > 0 && (
                        <div className="text-white mt-4 small">
                            <strong>🕘 Upload History</strong>
                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>

                            <ul className="list-group mt-2">
                                {uploadHistory.map((item, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-2">
                                        <span className="text-dark">{item.name}</span>
                                        <span className={`badge badge-${item.status === 'success' ? 'success' : 'danger'}`}>
            {item.status === 'success' ? '✅' : '❌'}
          </span>
                                    </li>
                                ))}
                            </ul>
                            </div>
                        </div>
                    )}

                </form>
            </li>
            {lastIngestedRepo && (
                <div className="bg-white text-dark mt-3 p-2 rounded small">
                    <strong>📦 Last Repo:</strong> {lastIngestedRepo.repo_name}<br />
                    <strong>🧾 Files Processed:</strong> {lastIngestedRepo.files_processed}<br />
                    <strong>📋 Summary:</strong>
                    <div className="mt-1" style={{ maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {lastIngestedRepo.repo_summary || "No summary available."}
                    </div>
                </div>
            )}

        </ul>
    );
};

export default Sidebar;
