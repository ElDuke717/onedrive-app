/**
 * Authentication Module for Microsoft Identity Platform
 * 
 * This module handles OAuth 2.0 authentication flow for the OneDrive application
 * using the Microsoft Authentication Library (MSAL) for Node.js.
 */

const msal = require("@azure/msal-node");
require("dotenv").config();

// MSAL configuration
const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    clientSecret: process.env.CLIENT_SECRET,
  }
};

// Create MSAL application instance
const cca = new msal.ConfidentialClientApplication(config);

// Scopes required for the application
const SCOPES = ["Files.Read", "Files.Read.All", "User.Read"];

/**
 * Generates the authorization URL for user login.
 * 
 * @param {string} redirectUri - The URI to redirect to after authentication.
 * @returns {Promise<string>} A promise that resolves to the authorization URL.
 */
async function getAuthUrl(redirectUri) {
  const authCodeUrlParameters = {
    scopes: SCOPES,
    redirectUri: redirectUri,
  };
  return await cca.getAuthCodeUrl(authCodeUrlParameters);
}

/**
 * Acquires an access token using the authorization code.
 * 
 * @param {string} authCode - The authorization code received after user login.
 * @param {string} redirectUri - The redirect URI used in the initial request.
 * @returns {Promise<Object>} A promise that resolves to the token response.
 */
async function getToken(authCode, redirectUri) {
  const tokenRequest = {
    code: authCode,
    scopes: SCOPES,
    redirectUri: redirectUri,
  };
  return await cca.acquireTokenByCode(tokenRequest);
}

/**
 * Refreshes the access token using a refresh token.
 * 
 * @param {string} refreshToken - The refresh token to use.
 * @returns {Promise<Object>} A promise that resolves to the new token response.
 */
async function refreshAccessToken(refreshToken) {
  const tokenRequest = {
    refreshToken: refreshToken,
    scopes: SCOPES,
  };
  return await cca.acquireTokenByRefreshToken(tokenRequest);
}

// Export the functions
module.exports = {
  getAuthUrl,
  getToken,
  refreshAccessToken,
  cca
};