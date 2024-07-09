/**
 * OneDrive API Integration Module
 * 
 * This module provides functions to interact with the Microsoft Graph API
 * for OneDrive operations.
 */

const axios = require("axios");

// Microsoft Graph API endpoint
const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0';

/**
 * Retrieves a list of files and folders from the root of the user's OneDrive.
 * 
 * @param {string} accessToken - The OAuth access token for authentication.
 * @returns {Promise<Array>} A promise that resolves to an array of file and folder objects.
 * @throws {Error} If there's an issue with the API request.
 */
async function listFiles(accessToken) {
    try {
        const response = await axios.get(`${GRAPH_API_ENDPOINT}/me/drive/root/children`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        return response.data.value;
    } catch (error) {
        console.error('Error in listFiles:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Downloads a specific file from OneDrive.
 * 
 * @param {string} accessToken - The OAuth access token for authentication.
 * @param {string} fileId - The ID of the file to download.
 * @returns {Promise<Stream>} A promise that resolves to a readable stream of the file content.
 * @throws {Error} If there's an issue with the API request.
 */
async function downloadFile(accessToken, fileId) {
    try {
        const response = await axios.get(
            `${GRAPH_API_ENDPOINT}/me/drive/items/${fileId}/content`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                responseType: "stream",
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error downloading file:", error.message);
        throw error;
    }
}

/**
 * Retrieves a list of users who have access to a specific file.
 * 
 * @param {string} accessToken - The OAuth access token for authentication.
 * @param {string} fileId - The ID of the file to check permissions for.
 * @returns {Promise<Array>} A promise that resolves to an array of user permission objects.
 * @throws {Error} If there's an issue with the API request.
 */
async function listUsersWithAccess(accessToken, fileId) {
    try {
        const response = await axios.get(`${GRAPH_API_ENDPOINT}/me/drive/items/${fileId}/permissions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        return response.data.value;
    } catch (error) {
        console.error('Error in listUsersWithAccess:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    listFiles,
    downloadFile,
    listUsersWithAccess
};