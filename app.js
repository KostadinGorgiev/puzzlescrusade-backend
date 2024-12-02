var debug = require("debug")("puzzlescrusade-backend:server");
var http = require("http");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const dotenv = require("dotenv");
const moment = require('moment-timezone');

dotenv.config();

const { Server } = require("socket.io"); // Import Socket.IO Server class
const { createProxyMiddleware } = require("http-proxy-middleware");

var usersRouter = require("./src/routes/users");
var dailyCheckInRouter = require("./src/routes/dailyCheckIn");
var taskRouter = require("./src/routes/task");
var cardRouter = require("./src/routes/card");
var adminRouter = require("./src/routes/admin");
const cardController = require("./src/controllers/cardController");
const userControler = require("./src/controllers/userController");

var usersMap = [];
var app = express();
var io;
// var io = socketIo();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.io = io;

// app.use(socketProxy);

app.get("/", async function (req, res) {
  let activeUsers = await userControler.getActiveUsers(usersMap);
  const serverTimezone = moment.tz.guess(); // Gets the server's timezone

  res.send({ status: "success", message: "app is running...", activeUsers, serverTimezone });
});
app.use("/users", usersRouter);
app.use("/daily-checkin", dailyCheckInRouter);
app.use("/task", taskRouter);
app.use("/card", cardRouter);
app.use("/admin", adminRouter);

app.get("/secret-url-reload-users-V4d1N6s5W8", async function (req, res) {
  usersMap.forEach((user) => {
    io.to(user.socketId).emit("ternimate_session");
  });
  res.send({ sucess: true });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var port = normalizePort(process.env.PORT || "8080");

var server = http.createServer(app);
io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from this origin and my frontend port = 5173
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});
io.on("connection", (socket) => {
  socket.on("addUser", (data) => {
    console.log("user connected", data.userId);
    if (data && data.userId) {
      let existUser = usersMap.find((user) => user.userId == data.userId);
      if (existUser) {
        console.log("ternimate_session for multiple device");
        // ternimate session for multiple device
        io.to(existUser.socketId).emit("ternimate_session");
        usersMap = usersMap.filter((user) => user.userId != existUser.userId);
      }
      socket.userId = data.userId;
      usersMap.push({
        userId: data.userId,
        socketId: socket.id,
      });
    }

    setTimeout(() => {
      let existUserTerminate = usersMap.find(
        (user) => user.userId == data.userId && user.socketId == socket.id
      );
      if (existUserTerminate) {
        console.log("ternimate_session for 1 hr", data.userId);
        // ternimate session for 1 hr long
        io.to(existUserTerminate.socketId).emit("ternimate_session");
        usersMap = usersMap.filter(
          (user) => user.userId != existUserTerminate.userId
        );
      }
    }, 60 * 60 * 1000); // 1 hr timeout
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.userId);
    usersMap = usersMap.filter((user) => user.userId != socket.userId);
  });
});

setInterval(() => {
  console.log("socket handler for live session", usersMap);
  usersMap.forEach((user) => {
    cardController.socketHandler(io, user);
  });
}, 5000);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);

  console.log("Server is running on");
}
