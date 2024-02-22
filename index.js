if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const port = process.env.PORT;
const express = require("express");
const app = express();
const connectDb = require("./config/db.js");
const userRoute = require("./routes/userRoute.js");
const chatRoute = require("./routes/chatRoute.js");
const messsageRoute = require("./routes/messageRoute.js");
const { NotFound, ErrorHandler } = require("./middleware/errorMiddleware.js");
const cors = require("cors");

const corsOptions = {
  origin: "https://sayheychat.netlify.app",
  credentials: true,
  optionSuccessStatus: 200,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions))

connectDb();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messsageRoute);


app.use(NotFound);
app.use(ErrorHandler);


const server = app.listen(port, () => {
  console.log(`listing to port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://sayheychat.netlify.app",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined this chat id" + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
