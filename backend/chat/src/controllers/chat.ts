import { Chat } from "../modles/chat.js";
import TryCatch from "../config/TryCatch.js";
import { AuthenticateReqest } from "../middleweres/isAuth.js";
import { json, Response } from "express";
import { Messages } from "../modles/message.js";
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config();

export const creatNewChat = TryCatch(async(req:AuthenticateReqest , res:Response) =>{
  const {otherUserId}  = req.body;
  const userId = req.user?._id;

  if(!otherUserId){
    res.status(400).json({
        message:"Other userid is required"
    })
    return;
  }

  const isUserExit = await Chat.findOne({
    users:{$all:[userId , otherUserId] , $size:2},
  });

  if(isUserExit){
    res.status(200).json({
        message:"chat already exit",
        chatId:isUserExit._id,
    })
    return;
  }
  const newChat = await Chat.create({
    users:[userId , otherUserId]
  })
  res.status(200).json({
        message:"Chat created succesfully",
        chatId:newChat._id
    })
})

export const getAllChat = TryCatch(async(req:AuthenticateReqest , res:Response) => {
    const userId = req.user?._id;

    if(!userId){
        res.status(400).json({
            message:"Userid Is missing"
        })
        return;
    }

    const allChat = await Chat.find({users:userId}).sort({updatedAt:-1});

    const chatWithUserData = await Promise.all(
    allChat.map(async (chat) => {
        const otherUserId = chat.users.find(
            (id) => id.toString() !== userId.toString()
        );

        const unseenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false,
        });

        if (!otherUserId) {
            return {
                user: { _id: null, name: "Unknown User" }, // Return a placeholder for undefined otherUserId
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount
                }
            };
        }

        try {
            const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
            return {
                user: (data as {user: any}).user,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount
                }
            };
        } catch (error: any) {
            console.log(error?.response?.data || error);
            return {
                user: { _id: otherUserId, name: "Unknown User" },
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount
                }
            };
        }
    })
);
    res.json({
        chats:chatWithUserData
    })
})

export const sendMessage = TryCatch(async(req:AuthenticateReqest , res:Response) =>{
    const senderId = req.user?._id;
    const {text , chatId } = req.body;
    const imageFile = req.file

    if(!senderId){
        res.status(401).json({
            message:"Unauthorized",
        })
        return;
    }

    if(!chatId){
        res.status(400).json({
            message:"ChatId Required",
        })
        return;
    }

    if(!text && !imageFile){
         res.status(400).json({
            message:"Either text or image is required",
        })
        return;
    }

    const chat = await Chat.findById(chatId);

    if(!chat){
        res.status(404).json({
            messages:"Chat not found"
        })
        return;
    }

    const isUserInChat = chat.users.some(
        (userId) => userId.toString() === senderId.toString()
    )

    if(!isUserInChat){
        res.status(403).json({
            message:"You are not a participant of this chat"
        })
        return;
    }

    const otherUserId = chat.users.find(
        (userId) => userId.toString() === senderId.toString()
    )

    if(!otherUserId){
        res.status(401).json({
            message:"No other user",
        })
        return;
    }

    //socket set up

    let messageData:any ={
        chatId:chatId,
        sender:senderId,
        seen:false,
        seenAt:undefined
    };

    if(imageFile){
        messageData.image = {
            url:imageFile.path,
            publicId:imageFile.fieldname
        };
        messageData.messageType="image";
        messageData.text= text || ""
    }else{
        messageData.text=text;
        messageData.messageType="text";
    }

    const message = new Messages(messageData);
    const savedMessage = await message.save();

    const latestMessageText = imageFile ? "image":text

    await Chat.findByIdAndUpdate(chatId , {
        latestMessage: {
            text:latestMessageText,
            sender: senderId
        },
        updatedAt:new Date(),
    }, {new : true});

    //emit to sockets

    res.status(200).json({
        message:savedMessage,
        sender:senderId
    })
})


export const getMessageByChat = TryCatch(async(req:AuthenticateReqest , res:Response) => {
    const userId=req.user?._id;
    const {chatId} = req.params;

     if(!userId){
        res.status(401).json({
            message:"Unauthorized",
        })
        return;
    }

     if(!chatId){
        res.status(400).json({
            message:"ChatId Required",
        })
        return;
    }

    const chat = await Chat.findById(chatId);

    if(!chat){
        res.status(404).json({
            messages:"Chat not found"
        })
        return;
    }

    const isUserInChat = chat.users.some(
        (userId) => userId.toString() === userId.toString()
    )

    if(!isUserInChat){
        res.status(403).json({
            message:"You are not a participant of this chat"
        })
        return;
    }

    const messageToMarkSeen = await Messages.find({
        chatId:chat,
        sender:{$ne : userId},
        seen:false
    });

    await Messages.updateMany({
         chatId:chat,
        sender:{$ne : userId},
        seen:false
        },
        {
            seen:true,
            seenAt:new Date()
        }
    );

    const messages = await Messages.find({chatId}).sort({createdAt:1});

    const otherUserId = chat.users.find((id) => id !== userId);

    try {
        const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);

        if(!otherUserId){
            res.status(404).json({
                message:"No Other user"
            })
            return;
        }

        //socket emit

        res.json({
            messages,
            user:data
        })
    } catch (error) {
        console.log(error)
            res.json({
                messages,
                user:{_id :otherUserId , name:"Unknown User"}
            })
        
    }

})