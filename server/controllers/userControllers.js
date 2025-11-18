import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

let razorpayInstance

if (razorpayKeyId && razorpayKeySecret) {
    razorpayInstance = new razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    })
} else {
    console.warn('Razorpay keys are not set. Payment routes will not work until you configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env')
}

const registerUser = async (req,res) =>{
    try{
        const {name,email,password} = req.body;

        if(!name || !email || !password){
            return res.json({success:false, message: 'Missing Details'})
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        const userData ={
            name,
            email, 
            password: hashedPassword
        }

        const newuser = new userModel(userData)
        const user = await newuser.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.json({success: true, token, user: {name:user.name}})
    }catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//  user login control function
const loginUser = async (req,res) =>{
    try{
        const { email,password} = req.body;
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message: 'User dose not exist'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

            res.json({success: true, token, user: {name:user.name}})

        }else{
            return res.json({success:false, message: 'Invalid credentials'})
        }
    }catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const userCredits = async (req,res) =>{
    try{
        const {userId} = req.body

        const user =await userModel.findById(userId)
        res.json({success:true, credits: user.creditBalance, user:{name:user.name}})
    }catch (error){
        console.log(error.message)
        res.json({ success:false, message:error.message})
    }
}

const paymentRazorpay = async(req,res)=>{
    try {
        if (!razorpayInstance) {
            return res.json({ success:false, message:'Payment is not configured on server. Please contact support.' })
        }
        const {userId, planId} = req.body

        const userData = await userModel.findById(userId)

        if(!userId || !planId){
            return res.json({success:false, message:error.message}) 
        }

        let credits, plan, amount, date

        switch (planId) {
            case 'Basic':
                plan ='Basic'
                credits = 100
                amount = 10
                break;

            case 'Advanced':
                plan ='Advanced'
                credits = 500
                amount = 50
                break;

            case 'Business':
                plan ='Business'
                credits = 5000
                amount = 250
                break;
        
            default:
                return res.json({success:false, message:'plan not found'})
        }

        date =Date.now();

        const transactionData ={
            userId,plan,amount,credits,date
        }

        const newTransaction = await transactionModel.create(transactionData)
        
        const Options = {
            amount:amount*100,
            currency:process.env.CURRENCY,
            receipt:newTransaction._id,
        }

        await razorpayInstance.orders.create(Options, (error, order)=>{
            if(error){
                console.log(error)
                return res.json({success:false, message:error.message})
            }
            res.json({success:true, order})
        })

    } catch (error) {
       console.log(error)
       res.json({success:false, message:error.message}) 
    }
}

const verifyRazorpay = async(req, res)=>{
    try {
        if (!razorpayInstance) {
            return res.json({ success:false, message:'Payment is not configured on server. Please contact support.' })
        }

        const {razorpay_order_id} =req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status === 'paid'){
            const transactionData = await transactionModel.findById(orderInfo.receipt)

            if(transactionData.payment){
                  return res.json({success:false, message:'payment faild'})
            }
            const userData = await userModel.findById(transactionData.userId)

            const creditBalance = userData.creditBalance+transactionData.credits
            await userModel.findByIdAndUpdate(userData._id, {creditBalance})

            await transactionModel.findByIdAndUpdate(transactionData._id, {payment:true})

            res.json({ success:true, message: "Credita Added"})
        }else{
            res.json({ success:true, message: "Payment failed"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})    
    }
}

export {registerUser, loginUser, userCredits, paymentRazorpay, verifyRazorpay}