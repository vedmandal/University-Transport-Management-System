import tripModel from "../models/trip.model.js";



export const startTrip = async (req, res) => {
  try {
    const { busId } = req.body;
    const driverId = req.user.id;

    if (!busId) {
      return res.status(400).send({ message: "BusId is required to start trip" });
    }

    const trip = await tripModel.create({
      busId,
      driverId,
      isActive: true
    });

    return res.status(201).send({
      success: true,
      message: "Trip started successfully",
      trip
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in starting trip",
      error
    });
  }
};

export const endTrip = async (req, res) => {
    try {
      const { id } = req.params;
  
      await tripModel.findByIdAndUpdate(id, { isActive: false });
  
      return res.status(200).send({
        success: true,
        message: "Trip ended successfully"
      });
  
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Error in ending trip",
        error
      });
    }
  };
  