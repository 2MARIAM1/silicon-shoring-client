import axios from 'axios';

const API_BASE = process.env.FASTAPI_APP_HOST || 'http://localhost:8000';

export const uploadFileToQdrant = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    console.log(API_BASE);
    const response = await axios.post(`${API_BASE}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0

    });

    return response.data;
};
