import {Server } from 'socket.io'
import http from 'http';
import express from 'express'


const app = express()

const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:["http://localhost:3000"],
        methods:["GET", "POST"]
    }
})

export const getReceiverSocketId = (nguoiNhanId) => {
    return userSocketMap[nguoiNhanId]
}

const userSocketMap ={};
 
io.on('connection',(socket)=>{
    console.log("a user connected",socket.id)

    const idNguoidung = socket.handshake.query.idNguoidung
    if(idNguoidung != "undefined") userSocketMap[idNguoidung] = socket.id

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    
    socket.on("disconnect",()=>{
    console.log("user disconnected",socket.id)
    delete userSocketMap[idNguoidung]
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

export {app,io,server}