/**
 * OneDrive Application Server
 *
 * This server handles authentication, file operations, and real-time updates
 * for the OneDrive application.
 */

const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const { getAuthUrl, getToken } = require("./auth");
const { listFiles, downloadFile, listUsersWithAccess } = require("./onedrive");

const app = express();


// Middleware setup
app.use(helmet());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
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

// Generate a random string to validate notifications
const validationToken = crypto.randomBytes(32).toString("hex");

/**
 * Initiates the OAuth authentication process.
 */
app.get("/auth", async (req, res) => {
  try {
    const authUrl = await getAuthUrl("http://localhost:3000/callback");
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating authentication URL:", error);
    res.status(500).send("Error generating authentication URL");
  }
});

/**
 * Handles the OAuth callback and stores the access token.
 */
app.get("/callback", async (req, res) => {
  try {
    const token = await getToken(
      req.query.code,
      "http://localhost:3000/callback"
    );
    req.session.accessToken = token.accessToken;
    req.session.accountId = token.account.homeAccountId;
    console.log(
      "Access Token received:",
      token.accessToken.substring(0, 20) + "..."
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error getting token:", error);
    res.status(500).send("Error during authentication");
  }
});

/**
 * Checks if the user is authenticated.
 */
app.get("/check-auth", (req, res) => {
  res.json({
    authenticated: !!req.session.accessToken && !!req.session.accountId,
  });
});

/**
 * Lists files from the user's OneDrive.
 */
app.get("/files", async (req, res) => {
  try {
    if (!req.session.accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const files = await listFiles(req.session.accessToken);
    res.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    res
      .status(500)
      .json({ error: "Error listing files", details: error.message });
  }
});

/**
 * Handles file downloads.
 */
app.get("/download/:fileId", async (req, res) => {
  try {
    if (!req.session.accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const fileStream = await downloadFile(
      req.session.accessToken,
      req.params.fileId
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.query.name || "download"}"`
    );
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
});

/**
 * Lists users with access to a specific file.
 */
app.get("/users/:fileId", async (req, res) => {
  try {
    if (!req.session.accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Pragma", "no-cache");
    const users = await listUsersWithAccess(
      req.session.accessToken,
      req.params.fileId
    );
    res.json(users);
  } catch (error) {
    console.error("Error listing users with access:", error);
    res.status(500).send("Error listing users with access");
  }
});

/**
 * Checks for updates to file permissions.
 */
app.get("/check-updates", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const files = await listFiles(req.session.accessToken);
    const updates = await Promise.all(
      files.map(async (file) => {
        if (!file.folder) {
          const users = await listUsersWithAccess(
            req.session.accessToken,
            file.id
          );
          return { fileId: file.id, users };
        }
      })
    );
    res.json(updates.filter(Boolean));
  } catch (error) {
    console.error("Error checking for updates:", error);
    res.status(500).json({ error: "Error checking for updates" });
  }
});

/**
 * Webhook endpoint for receiving change notifications.
 */
app.post("/webhook", (req, res) => {
  if (req.query.validationToken) {
    res.set("Content-Type", "text/plain");
    res.status(200).send(req.query.validationToken);
  } else {
    console.log("Change detected:", req.body);
    if (req.body.clientState === validationToken) {
      io.emit("fileChanged", req.body);
      res.status(202).end();
    } else {
      res.status(401).end();
    }
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = { validationToken };
