const app = require("express")();
var http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env"
});

server.listen(process.env.SOCKET_PORT, () => {
  console.log(`listening on *:${process.env.SOCKET_PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: [], //origins list goes here
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET, PUT, POST, DELETE"
  }
});

require("./globals");
// This is our socket server. All the events socket events will go here.
// Export the socket server
//module.exports = (io, app) => {
io.on("connection", async socket => {
  // socket code goes here
});

//};

app.set("io", io);

exports.module = server;
module.exports.io = io;
