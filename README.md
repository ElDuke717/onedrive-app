# onedrive-app
A server-side application that connects to OneDrive, lists files, allows them to be downloaded, lists users and displays when new users are added or removed.


# OneDrive App

## What does this program do?

This application connects to OneDrive and provides functionalities to:
1. List files.
2. Download files.
3. List users who have access to a file.
4. Display real-time updates when users are added or removed from a file.

## How to execute

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create an Azure app and fill in the clientId, clientSecret, and tenantId in `auth.js`.
4. Run `node server.js` to start the server.
5. Open `http://localhost:3000/auth` in your browser to authenticate.
6. Use the provided endpoints to list files, download files, and list users.

## Loom Video

[Link to the Loom video demonstrating the application]
