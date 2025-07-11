import express from 'express';
import { getAllUsers, getUserById, loginUser, myProfile, updateName, verifyOtp } from '../controllers/user.js';
import { isAuth } from '../middlewere/isAuth.js';

const router = express.Router();
router.post('/login' , loginUser)
router.post('/verify-otp' , verifyOtp)
router.get('/me' , isAuth , myProfile)
router.put('/update-name' , isAuth , updateName)
router.get('/all' , getAllUsers)
router.get('/user/:id' , getUserById)

export default router;