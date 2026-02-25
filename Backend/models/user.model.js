import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    role:{
        type:String,
        required:true,
        enum:["student","driver","admin","parent"]
    },

    // 👇 Only for students
    busId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Bus",
        required:false
    },

    parentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:false
    }

},{timestamps:true});

export default mongoose.model("User",UserSchema);