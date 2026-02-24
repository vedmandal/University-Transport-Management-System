import mongoose from "mongoose"


const bookingSchema=new mongoose.Schema({
    studentId:{
       type: mongoose.Schema.Types.ObjectId,
       ref:'User',
       required:true
    },
    busId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Bus',
        required:true
    },
    seatNumber:{
        type:Number,
        required:true
    },
    pickupStop:{
        type:String,
        required:true
    },
    dropStop:{
        type:String,
        required:true
    },
   date: {
       type:Date,
      

    },


    // ✅ NEW FIELD — Driver Approval
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  // ✅ NEW FIELD — Attendance
  attendance: {
    type: String,
    enum: ["not_marked", "present", "absent"],
    default: "not_marked"
  },

  // ✅ NEW FIELD — Final submission control
  finalized: {
    type: Boolean,
    default: false
  }

},{timestamps:true})


bookingSchema.pre("save", async function () {
    if (!this.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize to day
      this.date = today;
    }else {
     
      this.date.setHours(0, 0, 0, 0);
    }
   
  });


  bookingSchema.index(
    { studentId: 1, busId: 1, date: 1 },
    { unique: true }

  );
  

  bookingSchema.index(
    { busId: 1, seatNumber: 1, date: 1 },
    { unique: true }
  );

export default mongoose.model('Booking',bookingSchema)