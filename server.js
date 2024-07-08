const express = require("express");
const helmet = require("helmet");
const session = require('express-session');
const { getAuthUrl, getToken, refreshAccessToken, cca } = require("./auth");
const { listFiles, downloadFile, listUsersWithAccess } = require("./onedrive");

const app = express();

app.use(helmet());
app.use(express.static("public"));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

app.get("/auth", async (req, res) => {
  try {
    const authUrl = await getAuthUrl("http://localhost:3000/callback");
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating authentication URL:", error);
    res.status(500).send("Error generating authentication URL");
  }
});

app.get("/callback", async (req, res) => {
  try {
    const token = await getToken(req.query.code, "http://localhost:3000/callback");
    req.session.accessToken = token.accessToken;
    req.session.accountId = token.account.homeAccountId;
    console.log("Access Token received:", token.accessToken.substring(0, 20) + "...");
    res.redirect("/");
  } catch (error) {
    console.error("Error getting token:", error);
    res.status(500).send("Error during authentication");
  }
});

app.get("/check-auth", (req, res) => {
  res.json({ authenticated: !!req.session.accessToken && !!req.session.accountId });
});

app.get("/files", async (req, res) => {
  try {
    if (!req.session.accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const files = await listFiles(req.session.accessToken);
    res.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Error listing files", details: error.message });
  }
});

app.get("/download/:fileId", async (req, res) => {
    try {
      if (!req.session.accessToken) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const fileStream = await downloadFile(req.session.accessToken, req.params.fileId);
      res.setHeader("Content-Disposition", `attachment; filename="${req.query.name || 'download'}"`);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).send("Error downloading file");
    }
  });

  app.get("/users/:fileId", async (req, res) => {
    try {
      if (!req.session.accessToken) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      // Add these headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      const users = await listUsersWithAccess(req.session.accessToken, req.params.fileId);
      res.json(users);
    } catch (error) {
      console.error("Error listing users with access:", error);
      res.status(500).send("Error listing users with access");
    }
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});