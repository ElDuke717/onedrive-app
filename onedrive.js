const axios = require('axios');

const listFiles = async (accessToken) => {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me/drive/root/children', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        return response.data.value; // Make sure we're returning the array of files
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
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        console.log(`Users with access to file ${fileId}:`, response.data);
        return response.data.value;
    } catch (error) {
        console.error('Error in listUsersWithAccess:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const createSubscription = async (accessToken, fileId) => {
    try {
      const response = await axios.post('https://graph.microsoft.com/v1.0/subscriptions', {
        changeType: 'updated',
        notificationUrl: 'https://YOUR_PUBLIC_URL/webhook',
        resource: `/me/drive/items/${fileId}`,
        expirationDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        clientState: 'secretClientState'
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

module.exports = { listFiles, downloadFile, listUsersWithAccess };
