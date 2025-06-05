import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_HOST;

export const queryDocuments = async (question) => {
  try {
    const response = await axios.post(`${API_BASE}/query`, {
      question,

    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error querying documents:", error?.response?.data || error.message);
    throw error;
  }
};
