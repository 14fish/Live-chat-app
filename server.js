const path = require("path");
const express = require("express");
const http = require("http");
const sokcetio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

const PORT = process.env.PORT || 9000;

const app = express();
const server = http.createServer(app);
const io = sokcetio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Bot";

// Run whem user makes connection
io.on("connection", (socket) => {

    // Catch username and room
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Shows only to user connected
        socket.emit("message", formatMessage(botName, "Welcome chat!"));

        // Shows everyone except connected user
        socket.broadcast
			.to(user.room)
			.emit("message",formatMessage(botName, `${user.username} has joined the chat`));

		// Get users to show on dashboard
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		})
        console.log(user);
    });

    // Catch msg from input. Comes from main js 'chatMessage'
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message", formatMessage(user.username, msg));
	});
		
		// Shows when user disconnect
    socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat!`));

			// Get users to show on dashboard
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room)
			})
		}
		
	});

});

server.listen(PORT, () => console.log(`Running on port:${PORT}`));
