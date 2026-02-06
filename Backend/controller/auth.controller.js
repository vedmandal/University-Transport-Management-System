import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import userModel from "../models/user.model.js"


export const register=async(req,res)=>{
    try {
        const {name,email,password,role}=req.body;


        const user=await userModel.findOne({email});

        if(user){
            
            return res.status(500).send({message:"Email already exist"});
        }

        if(!email.endsWith("@krmu.edu.in")){
            return res.status(500).send({message:"university email required"})
        }

        const hash=await bcrypt.hash(password,3);

        const newuser=await userModel.create({
            name,email,password:hash,role
        })

        return res.status(201).send({
            success:true,
            message:"user registered successfully",
            newuser
        })



    } catch (error) {
        return res.status(500).send({
            success:false,
            message:"registeration failed",
            error
           
        })
        
    }
}


export const login=async(req,res)=>{
    try {
       const user=await userModel.findOne({email:req.body.email}).select("+password");

       if(!user){
        return res.status(500).send({message:"Email does not exist"})

       }

       const match= await bcrypt.compare(req.body.password,user.password);

       if(!match){
        return res.status(500).send({message:"password is wrong"})
       }

       const token= jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:"2d"})
         
       return res.status(200).send({
        success:true,
        message:"logged in successfully",
        role:user.role,
        token
       })
    } catch (error) {
        return res.status(500).send({
            success:false,
            message:"Error in Login",
           error
           })
        
    }
}
    

export const getAllDrivers = async (req, res) => {
    try {
      const drivers = await userModel
        .find({ role: "driver" })
        .select("_id name email");
  
      return res.status(200).send({
        success: true,
        message: "Drivers fetched successfully",
        drivers,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Error in fetching drivers",
        error,
      });
    }
  };

