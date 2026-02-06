import mongoose from "mongoose"

const tripSchema=new mongoose.Schema({
    busId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Bus',
        required:true
    },
    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
       

    },
    isActive:{
        type:Boolean,
        required:false
    },
    currentLocation:{
        lat:{
            type:Number,

        },
       lng: {
        type:Number,


        }


    }
},{timestamps:true})

export default mongoose.model('Trip',tripSchema);