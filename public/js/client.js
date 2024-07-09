// public/js/client.js
const socket = io('http://localhost:3000');

socket.on('updateUsers', (users) => {
    const usersDiv = document.getElementById('users');
    usersDiv.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.innerText = user.displayName;
        usersDiv.appendChild(userElement);
    });
});

// Example to manually emit an event (if needed)
// socket.emit('fileChange', { fileId: 'your-file-id' });
