const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Group = require("../models/group");
const GroupParticipant = require("../models/groupParticipant");
const { socket_io } = require("../socket.js");


async function handlePostCreateGroup(req, res) {

    //REQUIRED FIELDS ARE: GROUPNAME, USERIDS
    // console.log(req.body);
    const { groupName, userIds } = req.body;
    const newGroup = new Group({
        name: groupName,
    });

    try {
        await newGroup.save();
        const groupId = newGroup._id;
        console.log("Group is created")
        const newChat = new Chat({
            // senderId: userIds[0],
            groupId: groupId,
            groupName: groupName,
            chatType: "group",
            lastMessage: "New group " + groupName + " is created!",
        });
        await newChat.save();
        console.log("New chat id is: " + newChat._id);
        const currentChat = newChat._id;
        const totalUsers = userIds.length;
        for (let i = 0; i < totalUsers; i++) {
            const newGroupParticipant = new GroupParticipant({
                userId: new ObjectId(userIds[i]),
                groupId: groupId,
            });
            await newGroupParticipant.save();

            const lastUserJoined = await User.findOne({ _id: userIds[i] }, 'name');
            const newMessage = new Message({
                chatId: currentChat,
                message: lastUserJoined.name + " joined the chat!",
                type: "info"
            });
            await newMessage.save();
            console.log("New message is saved");

            if (i == totalUsers - 1) {
                await Chat.findByIdAndUpdate({ _id: currentChat }, { $set: { lastMessage: lastUserJoined.name + " joined the chat!" } });
            }
        }
        return res.status(200).send("Group created successfully");

    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal server error");
    }
}

async function handlePostAddInGroup(req, res) {
    //REQUIRED FIELDS ARE: GROUPID, USERIDS, CHATID
    const { groupId, userIds, chatId } = req.body;
    try {
        const totalUsers = userIds.length;
        for (let i = 0; i < totalUsers; i++) {
            const exists = await GroupParticipant.findOne({ userId: userIds[i], groupId: groupId });
            if (exists) {
                if (exists.isActive == 'true') {
                    console.log("this user already exists in this group");
                    continue;
                } else {
                    await GroupParticipant.findByIdAndUpdate(exists._id, { $set: { isActive: true, updatedAt: Date.now() } });
                    continue;
                }

            }
            const newGroupParticipant = new GroupParticipant({
                userId: userIds[i],
                groupId: groupId
            });
            await newGroupParticipant.save();

            const lastUserJoined = await User.findById(userIds[i], 'name');
            const newMessage = new Message({
                chatId: chatId,
                message: lastUserJoined.name + " joined the chat!",
                type: "info"
            });
            await newMessage.save();

            if (i === totalUsers - 1) {
                await Chat.findByIdAndUpdate(chatId, { $set: { lastMessage: lastUserJoined.name + " joined the chat!" } });
            }
        }
        return res.status(200).send("Added successfully");
    } catch (err) {
        return res.status(500).send("Internal server error");
    }
}



async function handlePostGroupList(req, res) {
    const currentUser = req.body.id;
    // console.log("current user is: "+ currentUser);
    try {
        const groupList = await GroupParticipant.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(currentUser)
                }
            },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupId",
                    foreignField: "_id",
                    as: "group",
                }
            },
            {
                $unwind: "$group"
            },
            {
                $lookup: {
                    from: "chats",
                    localField: "group._id",
                    foreignField: "groupId",
                    as: "chat",
                }
            },
            {
                $unwind: "$chat"
            },
            {

                $project: {
                    "group._id": 0,
                    "group.__v": 0,
                    // "chat._id": 0,
                    "chat.__v": 0
                }

            }, {
                $sort: { "chat.updatedAt": -1 }
            }
        ])
        // console.log(groupList);
        return res.status(200).send({ statusCode: 200, groupList: groupList });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ statusCode: 500, message: "Internal Server Error" });

    }
}


async function handlePostSendGroup(req, res) {

    const data = req.body;

    //REQUIRED FIELDS IN BODY: SENDERiD, SENDERnAME, MESSAGE, CHATiD, TYPE,      MIMETYPE, FILENAME

    try {

        //CREATE MESSAGE
        if (data.type == "text") {
            const message = new Message({
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                chatId: data.chatId
            });
            try {
                console.log(data.type + " is sent")
                await message.save();
            } catch (err) {
                console.log(err);
            }
        } else if (data.type == "image") {
            const message = new Message({
                senderId: data.senderId,
                senderName: data.senderName,
                type: data.type,
                filename: data.filename,
                chatId: data.chatId
            });
            try {
                console.log(data.type + " is sent")
                await message.save();
            } catch (err) {
                console.log(err);
            }
        }

        socket_io[data.senderId].to(data.groupName).emit('receive', data);
        // console.log(data.groupName);
        // const clients = io.sockets.adapter.rooms.get(data.groupName);
        // console.log(clients);
        // io.to(data.groupName).emit('receive', data);

        await Chat.updateOne({
            _id: data.chatId
        }, {
            $set: {
                updatedAt: Date.now(),
                lastMessage: data.message
            }
        })
        // socket_io.broadcast(data.groupName).emit('receive', data);

        return res.status(200).send({ message: "Message Sent" });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ statusCode: 500, message: "Internal Server error" });
    }
}

async function handlePostGroupChat(req, res) {

    //ADDED USERID
    const { chatId, userId, groupId } = req.body;

    try {
        // const {created, updated, isActive} = await GroupParticipant.findOne({userId: userId}, {createdAt: 1, updatedAt: 1, isActive: 1});
        const groupParticipant = await GroupParticipant.findOne(
            { userId: userId, groupId: groupId },
            { createdAt: 1, updatedAt: 1, isActive: 1 }
        );

        if (!groupParticipant) {
            return res.status(404).send({
                statusCode: 404,
                message: 'Group participant not found',
            });
        }

        const { createdAt, updatedAt, isActive } = groupParticipant;

        let messages;
        if (isActive) {
            // const messages = await Message.find({ chatId: chatId }).sort({ sentAt: 1 });
            const messages = await Message.find({
                chatId: chatId,
                sentAt: { $gte: createdAt }
            }).sort({ sentAt: 1 });

            // console.log(messages);
            return res.status(200).send({ statusCode: 200, message: 'success', data: messages });

        } else {
            const messages = await Message.find({
                chatId: chatId,
                sentAt: { $gte: createdAt, $lte: updatedAt }
            }).sort({ sentAt: 1 });

            // console.log(messages);
            return res.status(200).send({ statusCode: 200, message: 'success', data: messages });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ statusCode: 500, message: 'Internal server error' });

    }
}



async function handlePostParticipants(req, res) {
    const { groupId } = req.body;
    try {
        const participants = await GroupParticipant.find({ groupId: groupId, isActive: true }, { userId: 1, _id: 0 });
        const participantIds = participants.map(participant => participant.userId);
        const nonUserList = await User.find({ _id: { $nin: participantIds } }, { _id: 1, name: 1 });
        const userList = await User.find({ _id: { $in: participantIds } }, { _id: 1, name: 1 });

        return res.status(200).send({ statusCode: 200, nonUserList, userList });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ statusCode: 500, message: 'Internal server error' });
    }

}

async function handlePostDeleteFromGroup(req, res) {
    //GROUPID , USERIDS
    const { groupId, userIds } = req.body;
    try {
        const totalUsers = userIds.length;
        for (let i = 0; i < totalUsers; i++) {
            await GroupParticipant.findOneAndUpdate({ groupId: groupId, userId: userIds[i] }, { $set: { isActive: false, updatedAt: Date.now() } });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal server error");
    }
}

module.exports = {
    handlePostCreateGroup,
    handlePostAddInGroup,
    handlePostGroupList,
    handlePostSendGroup,
    handlePostGroupChat,
    handlePostParticipants,
    handlePostDeleteFromGroup,
}