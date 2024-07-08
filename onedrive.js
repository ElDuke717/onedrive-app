const axios = require('axios');

const listFiles = async (accessToken) => {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me/drive/root/children', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      return response.data.value;
    } catch (error) {
      console.error('Error in listFiles:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

const downloadFile = async (accessToken, fileId) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            responseType: 'stream'
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

const listUsersWithAccess = async (accessToken, fileId) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/permissions`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data.value;
    } catch (error) {
        console.error('Error listing users with access:', error);
        throw error;
    }
};

module.exports = { listFiles, downloadFile, listUsersWithAccess };
