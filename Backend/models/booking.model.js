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