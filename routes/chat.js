const express = require("express");
const app = express();


const router = require("express").Router();// den sidste parantes instansere linjen. // dummy route

const server = require("http").createServer(app);

const io = require("socket.io")(server);




io.on('connection', socket => {
    socket.on('send-chat-message', message => {
        console.log(message)
    })
})













router.get("/api/chat", (req, res) => {
    res.send({chat})
});



// a variable you assaign something too
module.exports = {
    router
};