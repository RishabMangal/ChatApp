const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8080;

// const redis = require("redis");
// const redisDB = redis.createClient("http://redis-18511.c14.us-east-1-2.ec2.cloud.redislabs.com:18511/");

// redisDB.on("connect", () => {
//   console.log("DB Connected sucessfully...");
// })

// redisDB.on("error", (err) => {
//   console.log("Error while connecting DB", err);
// })

var users = [];
var allMessages = [{ from: "Chat Bot", message: "Welcome to Lets Chat" }];
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
    // console.log("Welcome user :", m.username,socket.id);
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
    socket.emit("is-user-exists", flag);
    io.emit("all-users", users);
    io.emit("message-update", allMessages);
  });
  socket.on("send-message", (obj) => {
    allMessages.unshift(obj);
    socket.broadcast.emit("message-recieved", obj);
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
    socket.broadcast.emit("user-disconnected", socket.username);
    io.emit("all-users", users);
    io.emit("message-update", allMessages);
  });

  socket.on("disconnect", (e) => {
    io.emit("all-users", users);
    io.emit("message-update", allMessages);
    console.log("socket disconnected ", e);
    console.log("user disconnected ", socket.username);
    // io.emit("user-disconnected", socket.username);
  })

  // socket.on("find-user", (username) => {
  //     users.find((u, i, a) => {
  //         u.username===username
  //     })
  // })
});

app.get("/", (req, res) => {
  res.write("<p>Hello World</p>")
})


http.listen(port, () => console.log(`Server is running @ ${port}`));
