import axios from "axios";

const API_BASE = process.env.REACT_APP_API_HOST;

export const ingestRepository = async (url, signal = null) => {
    const response = await axios.post(`${API_BASE}/repositories`, {
        repo_url: url,
        branch: 'main'
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    });
    console.log(response.data);
    return response.data;
};
