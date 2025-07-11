import express from 'express';
import { isAuth } from '../middleweres/isAuth.js';
import { creatNewChat, getAllChat, getMessageByChat, sendMessage } from '../controllers/chat.js';
import { upload } from '../middleweres/multer.js';
const router = express.Router();

//
router.post('/create/chat' , isAuth , creatNewChat);
router.get("/chat/all" , isAuth , getAllChat);
router.post("/message" , isAuth , upload.single('image') , sendMessage);
router.get('/message/:chatId' , isAuth , getMessageByChat);
export default router;