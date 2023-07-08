const Chat = require("../models/chat");
const Message = require("../models/message");
const { socket_io } = require("../socket.js");

async function handlePostChat(req, res){
  // console.log("chat retrieval api was called");
    const { senderId, receiverId } = req.body;
    try {
      const messages = await Message.find({
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }).sort({ sentAt: 1 });
      // console.log("messages retrieved");
      await Message.updateMany(
        {
          senderId: receiverId,
          receiverId: senderId,
          isRead: false
        },
        {
          isRead: true
        }
      );
      return res.send({ statusCode: 200, message: 'success', data: messages });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ statusCode: 500, message: 'Internal server error' });
    }
}

async function handlePostSendMessage(req, res){
  // console.log("send message api is called");
    const data = req.body;
    try {
      //IF CHATID EXISTS
      if (data.chatId) {

        // console.log("send message api is called when chat exists");

        //CREATE MESSAGE
        if (data.type == "text") {
          const message = new Message({
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            chatId: data.chatId
          });
          try {
            await message.save();
          } catch (err) {
            console.log(err);
          }
        } else if (data.type == "image") {
          const message = new Message({
            senderId: data.senderId,
            receiverId: data.receiverId,
            type: data.mimetype,
            filename: data.filename,
            chatId: data.chatId
          });
          try {
            await message.save();
          } catch (err) {
            console.log(err);
          }
        }
        
        //EMIT THE SOCKET RECEIVE EVENT
        socket_io[data.senderId].to(data.receiverId).emit('receive', data);

        //UPDATE THE CHAT BETWEEN USERS
        await Chat.updateOne({
          _id: data.chatId
        }, {
          $set: {
            updatedAt: Date.now(),
            lastMessage: data.message
          }
        })

        return res.status(200).send({ message: "Chat updated successfully" });
      }


      //CREATE A CHAT IF  CHATID DOESNOT EXISTS
      // console.log("send message api is called when chat does not exists");


      const newChat = new Chat({
        senderId: data.senderId,
        receiverId: data.receiverId,
        lastMessage: data.message,
        // updatedAt: Date.now()
      })
      await newChat.save();

      //IF CHAT ID DOES NOT EXISTS THEN CREATE MESSAGE
      if (data.type == "text") {
        const message = new Message({
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          chatId: newChat._id
        });
        try {
          await message.save();
        } catch (err) {
          console.log(err);
        }
      } else if (data.type === "image") {
        const message = new Message({
          senderId: data.senderId,
          receiverId: data.receiverId,
          type: data.mimetype,
          filename: data.filename,
          chatId: newChat._id
        });
        try {
          await message.save();
        } catch (err) {
          console.log(err);
          
        }
      }


      //EMIT THE SOCKET RECEIVE EVENT
      socket_io[data.senderId].to(data.receiverId).emit('receive', data);
      // socket_io.to(data.receiverId).emit('receive', data);


      return res.status(200).send({ chatId: newChat._id, message: "Chat created successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send("Failed");
    }
}

async function handlePostChatList(req, res){
    const currentUser = req.body.id;
    console.log("current user in chatList is: "+currentUser)
    try {
      const chats = await Chat.find({
        $or: [
          { senderId: currentUser },
          { receiverId: currentUser }
        ]
      })
        .populate('senderId', 'name isOnline').populate('receiverId', 'name isOnline').exec();
      // console.log(chats);
      // console.log("chatList[0]: "+chats[1].senderId._id);
      // console.log("currentUser type is: "+ typeof currentUser);
      const chatList = chats.map(chat => ({
        name: chat.senderId._id.toString() !== currentUser ? chat.senderId.name : chat.receiverId.name,
        id: chat.senderId._id.toString() !== currentUser ? chat.senderId._id : chat.receiverId._id,
        isOnline: chat.senderId._id.toString() !== currentUser ? chat.senderId.isOnline : chat.receiverId.isOnline,
        chatId: chat._id,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        
      }));

      chatList.sort((a, b) => b.updatedAt - a.updatedAt);

      return res.status(200).send({ statusCode: 200, message: "success", data: chatList, chats: chats });
      // return res.status(200).send({statusCode: 200, message: "success", chats: chats});

    } catch (err) {
      console.log(err);
      return res.status(500).send({ statusCode: 500, message: "Internal Server Error" });
    }
}


module.exports = {
    handlePostChat,
    handlePostSendMessage,
    handlePostChatList,
}