const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin : '*'
    }
});

io.on('connection', (socket) => {
    console.log('user connected');
})

server.listen(PORT, () => {
    console.log('socket server started');
})