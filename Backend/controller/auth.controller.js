import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import userModel from "../models/user.model.js"
import BusModel from "../models/bus.model.js";
import crypto from "crypto";

import nodemailer from "nodemailer";


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

  export const searchStudents = async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query) {
        return res.json({ students: [] });
      }
  
      const students = await userModel.find({
        role: "student",
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } } // Added email search
        ]
      })
      .select("name email")
      .limit(10);
  
      res.json({ students });
    } catch (err) {
      res.status(500).json({ message: "Search failed" });
    }
  };
  export const createParent = async (req, res) => {
    try {
      const { name, email, studentId } = req.body;
  
      // 1. Authorization & Validation
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
  
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const student = await userModel.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      if (student.parentId) {
        return res.status(400).json({ message: "Student is already linked to a parent" });
      }
  
      // 2. Generate Credentials
      const autoPassword = crypto.randomBytes(4).toString("hex"); // e.g., 'a1b2c3d4'
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(autoPassword, salt);
  
      // 3. Save Parent & Link Student
      const parent = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role: "parent",
      });
  
      student.parentId = parent._id;
      await student.save();
  
      // 4. Send Email via Brevo HTTP API (Bypasses SMTP Timeout)
      const brevoData = {
        sender: { 
          name: "KRMU Transit Admin", 
          email: "mandalved643@gmail.com" // Must match your Verified Sender exactly
        },
        to: [{ email: email, name: name }],
        subject: "Your KRMU Parent Portal Account Credentials",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px;">
            <h2 style="color: #3b82f6; margin-top: 0;">Welcome to KRMU Transit</h2>
            <p>An account has been created for you to track <strong>${student.name}</strong>.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #eff6ff; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Temporary Password</p>
              <h1 style="margin: 10px 0; color: #1e293b; letter-spacing: 4px; font-family: monospace;">${autoPassword}</h1>
            </div>
  
            <p style="color: #64748b; font-size: 13px;">Please use this password to log in at the portal. You should update your password immediately after logging in.</p>
            
            <div style="margin-top: 25px; text-align: center;">
              <a href="https://university-transport-management-system-frontend.onrender.com/login" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                 Login to Dashboard
              </a>
            </div>
          </div>
        `
      };
  
      
  
      try {
        // Calling Brevo API over HTTPS (Port 443) - This avoids the ETIMEDOUT error
        await axios.post('https://api.brevo.com/v3/smtp/email', brevoData, {
          headers: {
            'api-key': process.env.BREVO_PASS, // Your xsmtpsib-... key
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
  
        return res.status(201).json({ 
          message: "Parent created and credentials emailed successfully." 
        });
  
      } catch (apiError) {
        console.error("Brevo API Error Details:", apiError.response?.data || apiError.message);
        
        // We return 201 because the user WAS created in the DB, just the email failed.
        return res.status(201).json({ 
          message: "Parent created, but email delivery failed. Please provide password manually.",
          tempPassword: autoPassword 
        });
      }
  
    } catch (error) {
      console.error("General Controller Error:", error);
      res.status(500).json({ message: "Internal server error during parent creation." });
    }
  };
  export const changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id; // Derived from your protect/auth middleware
  
      // 1. Find user
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // 2. Verify Old Password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      // 3. Hash New Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // 4. Update Database
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getParentBus = async (req, res) => {
    try {
      // 1️⃣ Find student linked to this parent
      const student = await userModel
        .findOne({
          parentId: req.user.id,
          role: "student"
        })
        .populate({
          path: "busId",
          populate: {
            path: "routeId",
            select: "name stops"
          }
        });
  
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "No linked student found"
        });
      }
  
      if (!student.busId) {
        return res.status(404).json({
          success: false,
          message: "No bus assigned to student"
        });
      }
  
      return res.status(200).json({
        success: true,
        studentName: student.name,
        bus: student.busId
      });
  
    } catch (error) {
      console.error("Parent Bus Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent bus"
      });
    }
  };

export const getAllParents = async (req, res) => {
  try {
    const parents = await userModel.find({ role: "parent" })
      .select("-password")
      .lean();

    const students = await userModel.find({
      role: "student",
      parentId: { $ne: null }
    }).select("name email parentId");

    const parentWithStudent = parents.map(parent => {
      const student = students.find(
        s => s.parentId?.toString() === parent._id.toString()
      );

      return {
        ...parent,
        student: student || null
      };
    });

    res.json({ parents: parentWithStudent });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignBusToStudent = async (req, res) => {
  try {
    const { studentId, busId } = req.body;

    /* 1️⃣ Only Admin */
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin allowed"
      });
    }

    /* 2️⃣ Validate Inputs */
    if (!studentId || !busId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Bus ID are required"
      });
    }

    /* 3️⃣ Check Student Exists */
    const student = await userModel.findOne({
      _id: studentId,
      role: "student"
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    /* 4️⃣ Check Bus Exists */
    const bus = await BusModel.findById(busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    /* 5️⃣ Assign Bus */
    student.busId = busId;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Bus assigned successfully",
      student: {
        id: student._id,
        name: student.name,
        busId: student.busId
      }
    });

  } catch (error) {
    console.error("Assign Bus Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign bus"
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .populate({
        path: "busId",
        populate: {
          path: "routeId",
          select: "name"
        }
      })
      .select("-password");

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
};