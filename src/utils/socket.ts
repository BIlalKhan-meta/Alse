import { io } from "socket.io-client";

export const socket = io("https://custom-dev.onlinetestingserver.com:3030/");

export const connectSocket = () => {
    if (socket && !socket?.connected) {
        socket.connect();
        socket.on("connect", () => {
            console.log("Socket Connected :: ", socket.id);
        });
    }
}

export const listenMessage = (chat_id, callback) => {
    return socket.on(chat_id, (res) => {
        callback(res)
    })

}

export const emitMessage = (payload) => {
    console.log("Payload ===>", payload);
    
    socket.emit("sendMessage", payload)
}

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.on("disconnect", () => {
            console.log("Socket Disconnected");
        });
    }
}