import busModel from "../models/bus.model.js";


export const addBus=async(req,res)=>{
    try {
        const {busNo,totalSeats,routeId,driverId}=req.body;

        if(!busNo || !totalSeats || !routeId || !driverId){
            return res.status(500).send({message:"required all field to add bus"})
        }

        const existingBus = await busModel.findOne({ busNo });
      if (existingBus) {
         return res.status(409).json({ message: "Bus already exists" });
       }
       if (totalSeats <= 0) {
        return res.status(400).json({ message: "Total seats must be greater than 0" });
      }


        const bus=await busModel.create({
            busNo,totalSeats,routeId,driverId
        })

        return  res.status(201).send({
            success:true,
            message:"Bus Added successfully",
            bus
        })


    } catch (error) {
        return  res.status(500).send({
            success:false,
            message:"Error in adding Bus",
           
        })
        
    }


}

export const getBuses=async(req,res)=>{
    try {
        const allBus=await busModel.find({}).populate("routeId")
        .populate("driverId", "name email");;

        return res.status(200).send({
            success:true,
            message:"got all buses succesfully",
            allBus
        })
    } catch (error) {
        console.log(error)
        return  res.status(500).send({
            success:false,
            message:"Error in getting all Buses",
           
        })
        
    }
}

export const getMyBus = async (req, res) => {
    try {
      const driverId = req.user.id;
  
      const bus = await busModel.findOne({ driverId });
  
      if (!bus) {
        return res.status(404).send({ message: "No bus assigned" });
      }
  
      res.status(200).send({
        success: true,
        busId: bus._id
      });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch bus" });
    }
  };
  
  export const getAllBusLocations = async (req, res) => {
    const buses = await busModel.find(
      { lastLocation: { $ne: null } },
      "_id busNo lastLocation"
    );
  
    res.send({
      success: true,
      buses,
    });
  };
  