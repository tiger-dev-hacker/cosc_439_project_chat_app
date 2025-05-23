require("dotenv").config();

const cors = require("cors");
const express = require("express"); 
const { chats } = require("./data/data");
const  dotenv = require("dotenv"); 
const connectDB = require("./config/db");
const colors = require("colors"); 
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes"); 
const messageRoutes = require("./routes/messageRoutes"); 
const path = require("path");

const {notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors())

app.use(express.json()); 

app.get('/', (req, res) => {
    res.send("API is running successfully");
});


app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname1, "/frontend/build")));
    
    
    
//   console.log("Registering wildcard route: *");

//   app.get("/*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler); 

const PORT = process.env.PORT || 5000
 const server= app.listen(5000, console.log(`server started on PORT ${PORT}`.yellow.bold)); 

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    }
}); 

io.on("connection", (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User joined Room: " + room);
    });

    socket.on('typing', (room) => socket.in(room).emit("typing")); 
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing")); 

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);

        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
}); 