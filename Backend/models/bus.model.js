import mongoose from "mongoose"

const BusSchema = new mongoose.Schema({
    busNo:{
        type:String,
        required:true
    },
    totalSeats:{
        type:Number,
        min: 1,
        required:true,
    },
    routeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Route",
        required:true
    },
    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    lastLocation: {
        lat: Number,
        lng: Number,
    },

    lastUpdatedAt: {
        type: Date,
    },

    /* =========================================
       ✅ ADDED: TRIP STATUS FIELD
    ========================================= */
    tripStatus: {
        type: String,
        enum: ["idle", "active", "completed"],
        default: "idle"
    }

},{timestamps:true})

export default mongoose.model('Bus',BusSchema);