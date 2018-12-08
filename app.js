//Setup
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path");
const fs = require("fs");

server.listen(1000);

app.use(express.static(path.join(__dirname, "")));
app.use((req, res) => res.sendFile(`${__dirname}/index.html`));

//Variables
var playerList = {};
var playerArray = [];

//Connection Function
io.sockets.on("connection", function(socket) {
  playerList[socket.id] = {health: 5, score: 0};
  playerArray.push(socket.id);
  console.log(playerList[socket.id]);
  socket.emit("connected", playerList.length);

  socket.on("shoot", function(cb) {
    if(socket == playerArray[0]) {
      playerList[playerArray[1]].health--;
      cb(playerList[playerArray[0]].score++);
      socket.broadcast.emit('health', playerList[playerArray[1]].health);
    }
    else {
      playerList[playerArray[0]].health--;
      cb(playerList[playerArray[1]].score++);
      socket.broadcast.emit('health', playerList[playerArray[0]].health);
    }
  });

  socket.on("disconnect", function() {
    socket.broadcast.emit("gameEnd");
    playerList = [];
  });
});
