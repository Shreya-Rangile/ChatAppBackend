const { Server } = require("socket.io");
const User = require("./models/user");
const GroupParticipant = require("./models/groupParticipant");

let socket_io = {};
function socketHandler(httpServer){
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }, 
        pingTimeout: 60000,
    });



// let socket_io  = io;
//SERVER SIDE SOCKET
let sender;
io.on("connection", (socket) => {
  console.log('NEW USER -- ', socket.id)
  // SOCKET SETUP PROCESS
  socket.on('set-up', async (permanentId) => {
    socket.join(permanentId);
    socket.emit('connected');
    socket_io[permanentId] = socket;
    sender = permanentId;
    // console.log("permanent id is: "+ permanentId);
    // console.log("permanent id type is: " +  typeof permanentId);

    await User.findByIdAndUpdate({ _id: permanentId }, { $set: { isOnline: true } });
    io.emit("userStatusChange", { userId: permanentId, isOnline: true });
    // socket.emit("userStatusChange", { userId: permanentId, isOnline: true });


    //JOIN TO ROOM FUNCTION CALL -- WRITE LOGIC HERE
    const list = await GroupParticipant.find({ userId: permanentId, isActive: true }).populate("groupId");
    // console.log(list);
    for (const i of list) {
      const groupId = i.groupId;
      // console.log(groupId.name);
      groupName = groupId.name;
      socket.join(groupName);
    }

  });
  // socket_io = socket;

  //SEND EVENT 
  socket.on('send', (data) => {

  });

  //ON LOGOUT SET THE USER AS OFFLINE
  socket.on("logout", async function () {
    if (sender) {
      console.log("sender is when logout: "+ sender);
      console.log("user logged out");
      await User.findByIdAndUpdate({ _id: sender.toString() }, { $set: { isOnline: false } });
      io.emit("userStatusChange", { userId: sender.toString(), isOnline: false });
    }

  });
  //ON DISCONNECT SET THE USER AS OFFLINE
  socket.on("disconnect", async function () {
    console.log('user disconnected');
    if (sender) {
      console.log("sender is when disconnect: "+ sender);

      await User.findByIdAndUpdate({ _id: sender.toString() }, { $set: { isOnline: false } });
      io.emit("userStatusChange", { userId: sender.toString(), isOnline: false });
    }
  });

  socket.on('isTyping', ({ userId, senderId }) => {
    socket.to(userId).emit('isTyping', { senderId });
  });

  socket.on('stopTyping', ({ userId, senderId }) => {
    socket.to(userId).emit('stopTyping', { senderId });
  });

});

return io;

}

module.exports = {
    socketHandler,
    socket_io,
};