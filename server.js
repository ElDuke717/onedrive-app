const express = require('express');
const helmet = require('helmet');
const socketIo = require('socket.io');
const http = require('http');
const { getAuthUrl, getToken } = require('./auth');
const { listFiles, downloadFile, listUsersWithAccess } = require('./onedrive');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(helmet());
app.use(express.static('public'));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "ws://localhost:3000"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  })
);

let accessToken = '';

app.get('/auth', async (req, res) => {
    try {
      const authUrl = await getAuthUrl('http://localhost:3000/callback');
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error generating authentication URL:', error);
      res.status(500).send('Error generating authentication URL');
    }
  });

app.get('/callback', async (req, res) => {
    try {
        const token = await getToken(req.query.code, 'http://localhost:3000/callback');
        accessToken = token.accessToken;
        console.log('Access Token received:', accessToken.substring(0, 20) + '...'); // Log part of the token
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Error getting token:', error);
        res.status(500).send('Error getting token');
    }
});

app.get('/files', async (req, res) => {
    try {
        const files = await listFiles(accessToken);
        res.json(files);
    } catch (error) {
        console.error('Error listing files:', error.response ? error.response.data : error.message);
        res.status(500).send('Error listing files: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
});

app.get('/download/:fileId', async (req, res) => {
    try {
        const fileStream = await downloadFile(accessToken, req.params.fileId);
        fileStream.pipe(res);
    } catch (error) {
        res.status(500).send('Error downloading file');
    }
});

app.get('/users/:fileId', async (req, res) => {
    try {
        const users = await listUsersWithAccess(accessToken, req.params.fileId);
        res.json(users);
    } catch (error) {
        res.status(500).send('Error listing users with access');
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Implement real-time updates here (if applicable)
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
