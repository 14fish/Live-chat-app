const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from url by placing qs cdn to chat.html
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


console.log(username, room);

const socket = io();

// Join chat room
socket.emit('joinRoom', {username, room});


// Get room users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down when text showed
    chatMessages.scrollTop = chatMessages.scrollHeight;
})


// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Find the #msg input and gets its value
    const msg = e.target.elements.msg.value;

    // Emitting msg to server
    socket.emit('chatMessage', msg);

    // Clear chat input
    e.target.elements.msg.value = '';
    // e.target.elements.msg.fous();
})


// Output message to dom
const outputMessage = ({username, text, time}) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${username} <span>${time}</span></p>
        <p class="text">
            ${text}
        </p>
    `;
    chatMessages.appendChild(div);
}


// Add room name to DOM
const outputRoomName = room => {
    roomName.innerText = room;
}

// Add user names to dashboard list
const outputUsers = users => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
    
}