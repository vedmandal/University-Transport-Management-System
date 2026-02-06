import bookingModel from "../models/booking.model.js";

/* ======================================================
   BOOK SEAT
====================================================== */
export const bookSeat = async (req, res) => {
  try {
    const { busId, seatNumber, pickupStop, dropStop } = req.body;
    const studentId = req.user.id;

    if (!busId || !seatNumber || !pickupStop || !dropStop) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    /* 🔥 TODAY (normalized) */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    /* 🔒 CHECK 1: seat already booked today */
    const seatBooked = await bookingModel.findOne({
      busId,
      seatNumber,
      date: { $gte: today, $lt: tomorrow },
    });

    if (seatBooked) {
      return res.status(400).send({
        success: false,
        message: "Seat already booked for today",
      });
    }

    /* 🔒 CREATE BOOKING
       - date handled by model (pre-save hook)
       - student double booking handled by unique index
    */
    const booking = await bookingModel.create({
      studentId,
      busId,
      seatNumber,
      pickupStop,
      dropStop,
      date: today
    });

    return res.status(201).send({
      success: true,
      message: "Seat booked successfully",
      booking,
    });
  } catch (error) {
    console.error("BOOKING ERROR:", error);

    /* 🔥 UNIQUE INDEX VIOLATION
       studentId + busId + date
    */
       if (error.code === 11000) {
        const isSeatTaken = error.message.includes("seatNumber");
        
        return res.status(400).send({
          success: false,
          message: isSeatTaken 
            ? "Oops! Someone just grabbed that seat a second ago. Try another!" 
            : "You have already booked a seat on this bus today.",
        });
      }

    return res.status(500).send({
      success: false,
      message: "Booking failed",
    });
  }
};

/* ======================================================
   GET BOOKED SEATS (FOR SEAT LAYOUT – TODAY ONLY)
====================================================== */
export const getBookedSeats = async (req, res) => {
  try {
    const { busId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const bookings = await bookingModel.find({
      busId,
      date: { $gte: today, $lt: tomorrow },
    });

    return res.status(200).send({
      success: true,
      message: "Booked seats fetched successfully",
      bookings,
    });
  } catch (error) {
    console.error("GET BOOKED SEATS ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch booked seats",
    });
  }
};

/* ======================================================
   BUS ATTENDANCE (DATE-WISE)
====================================================== */
export const getBusAttendance = async (req, res) => {
  try {
    const { busId } = req.params;
    const { date } = req.query;

    const selectedDate = date ? new Date(date) : new Date();
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    const bookings = await bookingModel
      .find({
        busId,
        date: { $gte: selectedDate, $lt: nextDay },
      })
      .populate("studentId", "name email");

    return res.status(200).send({
      success: true,
      count: bookings.length,
      attendance: bookings,
    });
  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};
