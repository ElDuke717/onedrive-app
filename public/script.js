/**
 * OneDrive File Management Application
 *
 * This script handles the client-side functionality for the OneDrive app,
 * including authentication, file listing, and user access management.
 */

document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth-btn");
  const filesUsersBody = document.getElementById("files-users-body");
  const updateStatus = document.getElementById("update-status");

  /**
   * Checks the authentication status and updates the UI accordingly.
   */
  function checkAuthentication() {
    fetch("/check-auth")
      .then((response) => response.json())
      .then((data) => {
        console.log("Authentication status:", data);
        if (data.authenticated) {
          authBtn.style.display = "none";
          listFiles();
        } else {
          authBtn.style.display = "block";
          filesUsersBody.innerHTML =
            "<tr><td colspan='3'>Please authenticate to view files.</td></tr>";
        }
      })
      .catch((error) => console.error("Error checking authentication:", error));
  }

  authBtn.addEventListener("click", () => {
    window.location.href = "/auth";
  });

  /**
   * Fetches and displays the list of files from OneDrive.
   */
  function listFiles() {
    filesUsersBody.innerHTML = "<tr><td colspan='3'>Loading files...</td></tr>";
    fetch("/files")
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Not authenticated, redirecting to /auth");
            window.location.href = "/auth";
            throw new Error("Not authenticated");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((files) => {
        if (Array.isArray(files) && files.length > 0) {
          filesUsersBody.innerHTML = files
            .map((item) => {
              if (item.folder) {
                return `
                                    <tr>
                                        <td>📁 ${item.name}</td>
                                        <td colspan="2">Directory</td>
                                    </tr>
                                `;
              } else {
                return `
                                    <tr>
                                        <td>📄 ${item.name}</td>
                                        <td id="users-${item.id}">Checking access...</td>
                                        <td>
                                            <button class="download-btn" data-file-id="${item.id}" data-file-name="${item.name}">Download</button>
                                        </td>
                                    </tr>
                                `;
              }
            })
            .join("");

          files
            .filter((item) => !item.folder)
            .forEach((file) => listUsers(file.id));
          addDownloadEventListeners();
        } else {
          filesUsersBody.innerHTML =
            "<tr><td colspan='3'>No files found or empty response</td></tr>";
        }
      })
      .catch((error) => {
        console.error("Error listing files:", error);
        filesUsersBody.innerHTML = `<tr><td colspan='3'>Error loading files: ${error.message}</td></tr>`;
      });
  }

  /**
   * Fetches and displays the list of users with access to a specific file.
   * @param {string} fileId - The ID of the file to check access for.
   */
  function listUsers(fileId) {
    const timestamp = new Date().getTime();
    fetch(`/users/${fileId}?_=${timestamp}`)
      .then((response) => response.json())
      .then((users) => {
        updateUserCell(fileId, users);
      })
      .catch((error) => {
        console.error("Error listing users:", error);
        updateUserCell(fileId, null, error);
      });
  }

  /**
   * Updates the user access cell in the UI for a specific file.
   * @param {string} fileId - The ID of the file to update.
   * @param {Array} users - The list of users with access.
   * @param {Error} [error] - Any error that occurred during the update.
   */
  function updateUserCell(fileId, users, error = null) {
    const userCell = document.getElementById(`users-${fileId}`);
    if (userCell) {
      if (error) {
        userCell.innerHTML = "Error loading users";
      } else if (users && users.length > 0) {
        const currentUser = users[0]; // Assuming the first user is always the owner
        const otherUsers = users.slice(1);

        let userList = `you`;
        if (otherUsers.length > 0) {
          userList += `, ${otherUsers
            .map((user) => user.displayName)
            .join(", ")}`;
        }

        userCell.innerHTML = userList;
      } else {
        userCell.innerHTML = "Only you";
      }
    }
  }

  /**
   * Adds click event listeners to all download buttons.
   */
  function addDownloadEventListeners() {
    document.querySelectorAll(".download-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const fileId = this.getAttribute("data-file-id");
        const fileName = this.getAttribute("data-file-name");
        downloadFile(fileId, fileName);
      });
    });
  }

  /**
   * Initiates the file download process.
   * @param {string} fileId - The ID of the file to download.
   * @param {string} fileName - The name of the file to download.
   */
  function downloadFile(fileId, fileName) {
    window.location.href = `/download/${fileId}?name=${encodeURIComponent(
      fileName
    )}`;
  }

  /**
   * Checks for updates to file permissions and updates the UI.
   */
  function checkForUpdates() {
    fetch("/check-updates")
      .then((response) => response.json())
      .then((updates) => {
        updates.forEach((update) => {
          updateUserCell(update.fileId, update.users);
        });
      })
      .catch((error) => console.error("Error checking for updates:", error));
  }

  // Check for updates every 10 seconds
  setInterval(checkForUpdates, 10000);

  // Initial authentication check
  checkAuthentication();
});
