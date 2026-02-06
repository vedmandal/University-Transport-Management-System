import routeModel from "../models/route.model.js";

export const addRoute=async(req,res)=>{
    try {
        const { routeName, stops } = req.body;

        

    if (!routeName || !stops || stops.length === 0) {
      return res.status(400).send({ message: "Route name and stops required" });
    }

    const route = await routeModel.create({ routeName, stops });

    return res.status(201).json({
      success: true,
      message: "Route added successfully",
      route
    });

    } catch (error) {
        return res.status(500).send({
            success:false,
            message:"Error adding route",
            error
        })
        
    }
}


export const getRoutes=async(req,res)=>{
    try {
        const allRoutes=await routeModel.find({}).select("_id routeName");

        return res.status(200).send({
            success:true,
            message:"got all routes succesfully",
            allRoutes
        })

    } catch (error) {

        return res.status(500).send({
            success:false,
            message:"Error in getting  all routes",
            error
        })
        
    }
}


export const getSingleRoute = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Route ID is required",
      });
    }

    const route = await routeModel.findById(id)

    if (!route) {
      return res.status(404).send({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Route fetched successfully",
      route,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in fetching route",
    });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await routeModel.findByIdAndDelete(id);

    if (!route) {
      return res.status(404).send({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error deleting route",
    });
  }
};
export const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { routeName, stops } = req.body;

    if (!routeName || !stops || stops.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Route name and stops required",
      });
    }

    const updatedRoute = await routeModel.findByIdAndUpdate(
      id,
      { routeName, stops },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(404).send({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Route updated successfully",
      route: updatedRoute,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error updating route",
    });
  }
};
