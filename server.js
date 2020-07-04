const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;
var users = [];
var allMessages = [];
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    // console.log("New Connection has been made");
    socket.on("join-chat", (m) => {
        // console.log("Welcome user :", m.username);
        // console.log("users before :", users);
        socket.username = m.username;
        // users[socket.username] = socket;
        var userObj = {
            username: m.username,
            socketId: socket.id
        }
        users.push(userObj)
        // console.log("users after :", users);
        io.emit("all-users", users);
        io.emit("message-update",allMessages);
    });
    socket.on("send-message", (obj) => {
        // console.log("message recieveed from client: ", obj);
        allMessages.push(obj);
        io.emit("message-update",allMessages);
        
    })
    // socket.on("find-user", (username) => {
    //     users.find((u, i, a) => {
    //         u.username===username
    //     })
    // })
})

http.listen(port, () => console.log(`Server is running @ ${port}`));