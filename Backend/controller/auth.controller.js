import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import userModel from "../models/user.model.js"
import BusModel from "../models/bus.model.js";


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
        name: { $regex: query, $options: "i" }  // case insensitive
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
      const { name, email, password, studentId } = req.body;
  
      /* 1️⃣ Only Admin */
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin allowed" });
      }
  
      /* 2️⃣ Validate Student */
      const student = await userModel.findOne({
        _id: studentId,
        role: "student"
      });
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      /* 3️⃣ Prevent Duplicate Student Linking */
      if (student.parentId) {
        return res.status(400).json({
          message: "This student already has a linked parent"
        });
      }
  
      /* 4️⃣ Prevent Duplicate Email */
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists"
        });
      }
  
      /* 5️⃣ HASH PASSWORD USING BCRYPT */
      const salt = await bcrypt.genSalt(3);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      /* 6️⃣ Create Parent */
      const parent = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role: "parent"
      });
  
      /* 7️⃣ Link Student */
      student.parentId = parent._id;
      await student.save();
  
      res.status(201).json({
        message: "Parent created and linked successfully"
      });
  
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