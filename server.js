const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8080;
var users = [];
var allMessages = [];
app.use(express.static(path.join(__dirname, "public")));

const checkUser = (u) => {
  let temp = false;
  users.forEach((usr, i) => {
    if (usr.username === u) {
      // console.log("usr is:  ", usr);
      temp = true;
    }
  });
  // console.log("temp is: ", temp);
  return temp;
};

io.on("connection", (socket) => {
  // console.log("New Connection has been made");
  socket.on("join-chat", (m) => {
    // console.log("Welcome user :", m.username);
    // console.log("users before :", users);
    socket.username = m.username;
    // users[socket.username] = socket;
    var userObj = {
      username: m.username,
      socketId: socket.id,
    };
    var flag = checkUser(userObj.username);
    // console.log("flag is: ", flag);
    if (!flag) users.unshift(userObj);
    // socket.emit("is-user-exists", flag);
    io.emit("all-users", users);
    io.emit("message-update", allMessages);
  });
  socket.on("send-message", (obj) => {
    allMessages.unshift(obj);
    if (allMessages.length > 100)
      allMessages.splice(100, allMessages.length - 100);
    io.emit("message-update", allMessages);
  });
  socket.on("sign-out", (u) => {
    for (let i = 0; i < users.length; i++)
    {
      if (users[i].username === u) {
        users.splice(i, 1);
        break;
      }
    }
    io.emit("all-users", users);
    io.emit("message-update", allMessages);
  });
  // socket.on("find-user", (username) => {
  //     users.find((u, i, a) => {
  //         u.username===username
  //     })
  // })
});

http.listen(port, () => console.log(`Server is running @ ${port}`));
