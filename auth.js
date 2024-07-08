const msal = require("@azure/msal-node");
require("dotenv").config();

const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    clientSecret: process.env.CLIENT_SECRET,
  }
};

const cca = new msal.ConfidentialClientApplication(config);

const getAuthUrl = async (redirectUri) => {
  const authCodeUrlParameters = {
    scopes: ["Files.Read", "Files.Read.All", "User.Read"],
    redirectUri: redirectUri,
  };
  return await cca.getAuthCodeUrl(authCodeUrlParameters);
};

const getToken = async (authCode, redirectUri) => {
  const tokenRequest = {
    code: authCode,
    scopes: ["Files.Read", "Files.Read.All", "User.Read"],
    redirectUri: redirectUri,
  };
  return await cca.acquireTokenByCode(tokenRequest);
};

const refreshAccessToken = async (refreshToken) => {
  const tokenRequest = {
    refreshToken: refreshToken,
    scopes: ["Files.Read", "Files.Read.All", "User.Read"],
  };
  return await cca.acquireTokenByRefreshToken(tokenRequest);
};

module.exports = { getAuthUrl, getToken, refreshAccessToken, cca };