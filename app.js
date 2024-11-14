var debug = require("debug")("puzzlescrusade-backend:server");
var http = require("http");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const dotenv = require("dotenv");

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

var usersMap = {};
var intervalMap = {};
var app = express();
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
  res.send({ status: "success", message: "app is running...", activeUsers });
});
app.use("/users", usersRouter);
app.use("/daily-checkin", dailyCheckInRouter);
app.use("/task", taskRouter);
app.use("/card", cardRouter);
app.use("/admin", adminRouter);

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
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from this origin and my frontend port = 5173
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});
io.on("connection", (socket) => {
  socket.on("addUser", (data) => {
    console.log("addUser", data.userId);

    if (data && data.userId) {
      socket.userId = data.userId;
      usersMap[data.userId] = socket.id;
      intervalMap[data.userId] = setInterval(() => {
        cardController.socketHandler(io, usersMap, data.userId);
      }, 5000);
    }
  });
  socket.on("disconnect", () => {
    console.log("disconnecty", intervalMap[socket.userId]);
    clearInterval(intervalMap[socket.userId]);
    delete usersMap[socket.userId];
    delete intervalMap[socket.userId];
  });
});

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
