import axios from 'axios';

const API_BASE = process.env.FASTAPI_APP_HOST || 'http://localhost:8000';

/**
 * Queries documents using a question and top-k parameter
 * @param {string} question - User's query
 * @param {number} k - Number of top results to retrieve
 * @returns {Promise<{question: string, answer: string, raw_results: string[]}>}
 */
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
