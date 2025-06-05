import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { ToastContainer } from 'react-toastify';
import { uploadFileToQdrant } from "../services/UploadService";
import Sidebar from "../components/Sidebar/Sidebar";

const UploadScreen = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (!selected.length) {
            Swal.fire('Invalid files', 'Only PDF files are allowed.', 'error');
        } else {
            setFiles(prev => [...prev, ...selected]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (!droppedFiles.length) {
            Swal.fire('Invalid files', 'Only PDF files are allowed.', 'error');
        } else {
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const handleUpload = async () => {
        setLoading(true);
        const results = [];

        for (const file of files) {
            try {
                const res = await uploadFileToQdrant(file);
                // If server responds with status 200, mark as success
                results.push({
                    name: file.name,
                    status: 'success',
                    chunks: res.chunks,
                    validation: res.validation,
                });
            } catch (error) {
                // Axios errors only go here if request failed (not just slow)
                const message = error?.response?.data?.detail || error.message || "Unknown error";
                results.push({
                    name: file.name,
                    status: 'error',
                    errorMessage: message,
                });
            }
        }

        setUploadResults(results);
        setLoading(false);

        const failedFiles = results.filter(r => r.status === 'error');

        if (failedFiles.length === 0) {
            Swal.fire('✅ Upload Complete', 'All files uploaded successfully.', 'success');
        } else {
            const errorList = failedFiles.map(f => `<li><b>${f.name}</b>: ${f.errorMessage}</li>`).join('');
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
            <Sidebar/>
        <div className="container-fluid py-4">
            <h2 className="mb-4">Upload PDFs to Qdrant</h2>

            <div className="form-group">
                <label>Select PDF files:</label>
                <input type="file" accept="application/pdf" multiple className="form-control" onChange={handleFileChange} />
            </div>

            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border rounded p-4 text-center mt-3 bg-white"
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
            >
                <p className="text-muted m-0">Or drag and drop PDFs here</p>
            </div>

            <button
                className="btn btn-primary mt-3"
                onClick={handleUpload}
                disabled={loading || files.length === 0}
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>

            {uploadResults.length > 0 && (
                <div className="mt-4">
                    <h6>Upload Results:</h6>
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
        </div>
            <ToastContainer position="top-right" autoClose={4000} />
        </div>
    );
};

export default UploadScreen;
