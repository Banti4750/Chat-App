import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticateReqest } from "../middlewere/isAuth.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async(req , res) =>{
    const {email} = req.body;

    const rateLimitKey = `otp:ratelimit;${email}`
    const ratelimit = await redisClient.get(rateLimitKey);

    if(ratelimit){
        res.status(429).json({
            message:"Too amny requests.Please try after some time"
        })
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp,{
        EX:300
    } );

    await redisClient.set(rateLimitKey , "true" , {
        EX:60
    })

    const message = {
        to:email,
        subject:"OTP for login",
        body:`Your OTP for login is ${otp} , it is valid for 5 minutes`
    }

    await publishToQueue("send-otp" , message);

    res.status(200).json({
        message:"OTP sent successfully to your email"
    })

})

export const verifyOtp = TryCatch(async(req , res) =>{
    try {
        const { email , otp:enterdOtp} = req.body;

        if(!email || !enterdOtp){
            res.status(400).json({
                message:"Email and Otp required"
            })
            return;
        }
         const otpKey = `otp:${email}`;
         const storedOtpRedis = await redisClient.get(otpKey);

        if(   enterdOtp !== storedOtpRedis){
            res.status(401).json({
                message:"Invalid or Exired otp"
            })
            return;
        }

        await redisClient.del(otpKey);

        // add user to table 
        let user = await User.findOne({email});
        if(!user){
            const name = email.slice(0,8);
            user = await User.create({name , email});
        }

        const token = generateToken(user);
        res.status(200).json({
            message:"User verified",
            user,
            token
        })
    } catch (error:any) {
        res.status(500).json({
            message:error.message
        })
        console.log(error.message)
    }
})

export const myProfile = TryCatch(async(req:AuthenticateReqest , res) =>{
    const user = req.user;

    res.status(200).json({
        user
    })
})

export const updateName = TryCatch(async(req: AuthenticateReqest, res) => {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
    }

    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const token =  generateToken(user)

    res.status(200).json({
        message: "Name updated successfully",
        user,
        token
    });
});

export const getUserById = TryCatch(async(req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
        user
    });
});

export const getAllUsers = TryCatch(async(req, res) => {
    const users = await User.find({});

    res.status(200).json({
        users
    });
});