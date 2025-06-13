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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openRepoModal = () => setIsModalOpen(true);
    const closeRepoModal = () => setIsModalOpen(false);

    useEffect(() => {
        const saved = localStorage.getItem('uploadHistory');
        if (saved) setUploadHistory(JSON.parse(saved));

        const savedRepo = localStorage.getItem('lastIngestedRepo');
        if (savedRepo) setLastIngestedRepo(JSON.parse(savedRepo));
    }, []);

    useEffect(() => {
        setLastIngestedRepo(null);
        localStorage.removeItem('lastIngestedRepo');
    }, [repoUrl]);


    const handleRepoSubmit = async (e) => {
        e.preventDefault();
        if (!repoUrl.trim()) {
            toast.error("Please enter a GitHub repository URL");
            return;
        }

        setLoadingRepo(true);
        try {
            const data = await toast.promise(
                ingestRepository(repoUrl),
                {
                    pending: "📚 Ingesting repository... This may take a while.",
                    success: `✅ Repository ingested successfully!`,
                    error: "❌ Error ingesting repository",
                },
                { autoClose: 5000 }
            );
            setLastIngestedRepo(data);
            localStorage.setItem('lastIngestedRepo', JSON.stringify(data));

        } catch (error) {
            // Already handled by toast.promise
        } finally {
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
                await toast.promise(
                    uploadFileToQdrant(file, (event) => {
                        const percent = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                    }),
                    {
                        pending: `📤 Uploading ${file.name}...`,
                        success: `${file.name} uploaded successfully!`,
                        error: `${file.name} failed to upload.`,
                    },
                    { autoClose: 5000 }
                );

                newHistory.push({ name: file.name, status: 'success', time });
            } catch (error) {
                newHistory.push({ name: file.name, status: 'error', time });
            }
        }

        const updated = [...newHistory, ...uploadHistory].slice(0, 5);
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
                <img src="/images/logo-wemanity-white.png" alt="Logo" style={{ width: '80%',  maxWidth: '180px' }} />
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
                <>
                    <div
                        className="bg-white text-dark mt-3 mx-3 p-3 rounded small repo-summary-card"
                        style={{ cursor: 'pointer' }}
                        onClick={openRepoModal}
                    >
                        <strong>📦 Last Repo:</strong> {lastIngestedRepo.repo_name}<br />
                        <strong>🧾 Files Processed:</strong> {lastIngestedRepo.files_processed}<br />
                        <strong>📋 Summary:</strong>
                        <div className="mt-1" style={{ maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                            {lastIngestedRepo.repo_summary || "No summary available."}
                        </div>
                        <div className="text-primary text-right small">Click to expand</div>
                    </div>

                    {/* ✅ Bootstrap Modal */}
                    <div
                        className={`modal fade ${isModalOpen ? 'show d-block' : ''}`}
                        tabIndex="-1"
                        role="dialog"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">📦 Last Repository Details</h5>
                                    <button type="button" className="close" onClick={closeRepoModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div
                                    className="modal-body"
                                    style={{
                                        maxHeight: '70vh',
                                        overflowY: 'auto',
                                        overflowX: 'hidden'
                                    }}
                                >
                                    <p><strong>Name:</strong> {lastIngestedRepo.repo_name}</p>
                                    <p><strong>Files Processed:</strong> {lastIngestedRepo.files_processed}</p>
                                    <p><strong>Summary:</strong></p>
                                    <pre className="bg-light p-2 rounded" style={{ whiteSpace: 'pre-wrap' }}>
              {lastIngestedRepo.repo_summary || "No summary available."}
            </pre>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary btn-sm" onClick={closeRepoModal}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}


        </ul>
    );
};

export default Sidebar;
