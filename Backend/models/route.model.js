import mongoose from "mongoose"


const RouteSchema=new mongoose.Schema({
    routeName:{
        type:String,
        required:true,
        unique:true
    },
    stops:[
        {
            name:{type:String,required:true},
            lat:{type:Number},
            lng:{type:Number},
           

        }
    ]
       
    
},{timestamps:true})

export default mongoose.model('Route',RouteSchema);