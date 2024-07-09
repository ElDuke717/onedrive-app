# OneDrive App 👩🏻‍💻

This is a server-side Node.js application with a web interface that integrates with Microsoft OneDrive. It allows users to view their files, download them, and see who has access to each file.

## Features

This application does the following:

1. Authenticates with Microsoft OneDrive
2. Lists files and folders from the user's OneDrive
3. Downloads files directly from OneDrive
4. Display users who have access to each file

## Prerequisites

- Node.js (v12 or later)
- npm
- A Microsoft Azure account or an Office 365 account
- A registered application in the Azure portal with appropriate permissions

## Setup and Installation

1. Clone this repository:

   ```
   git clone https://github.com/your-username/onedrive-app.git
   cd onedrive-app
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   CLIENT_ID=your_azure_client_id
   TENANT_ID=your_azure_tenant_id
   CLIENT_SECRET=your_azure_client_secret
   SESSION_SECRET=your_session_secret
   ```

   Replace the placeholders with your actual Azure app credentials and a secure random string for the session secret. These will be provided separately for the demo.

4. Start the server:

   ```
   npm start
   ```

5. Open your web browser and navigate to `http://localhost:3000/`
6. Click the "Authenticate" button to log in with your Microsoft account.

## Usage

1. Click the "Authenticate" button to log in with your Microsoft account.
2. Once authenticated, you'll see a list of your OneDrive files and folders.
3. Use the "Download" button next to each file to download it.
4. The "Users with Access" column shows who has access each file.
5. The list of users with access is automatically updated.

## Architecture

- `server.js`: The main Express.js server file
- `auth.js`: Handles Microsoft OAuth authentication
- `onedrive.js`: Contains functions for interacting with the OneDrive API
- `public/script.js`: Client-side JavaScript for the web interface
- `public/index.html`: The main HTML page for the web interface

## Limitations

- This app is designed for personal use and testing. It may need modifications for production use.
- The app currently only supports read operations on OneDrive files.
- Real-time updates are simulated through periodic polling rather than using actual push notifications. This may not be efficient for large numbers of files or users, but was chosen for simple set-up and implementation over websockets.

## Loom Video

[Loom video demonstrating the application](https://www.loom.com/share/4bf6ef51528c4016a8d30dc0913884c4?sid=4270e68b-ede5-41ae-b6fe-087d26eee4ba)

## Future Enhancements

- Implement true real-time updates using Microsoft Graph webhooks instead of polling to provide instant notifications when file permissions change.
- Add the ability to open folders and navigate through the file structure.
- Add support for uploading files to OneDrive.
- Implement file sharing functionality to allow users to share files with others.
- Add capabilities to create, edit, move, and delete files directly from the app interface.
- Improve the user interface with more detailed file information and additional actions.
- Implement a folder structure view and allow users to navigate through their OneDrive folders.
