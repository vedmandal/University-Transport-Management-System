import bookingModel from "../models/booking.model.js";
import mongoose from "mongoose";
/* ======================================================
   BOOK SEAT (Student)
====================================================== */
import userModel from "../models/user.model.js"; // 🔥 ADD THIS

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

    /* ===========================================
       🔐 NEW RESTRICTION LOGIC (IMPORTANT)
    =========================================== */

    const student = await userModel.findById(studentId);

    if (!student.busId) {
      return res.status(400).send({
        success: false,
        message: "No bus assigned to you by admin",
      });
    }

    if (student.busId.toString() !== busId) {
      return res.status(403).send({
        success: false,
        message: "You can only book seats in your assigned bus",
      });
    }

    /* ===========================================
       CONTINUE NORMAL BOOKING LOGIC
    =========================================== */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const seatBooked = await bookingModel.findOne({
      busId,
      seatNumber,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ["pending", "approved"] }
    });

    if (seatBooked) {
      return res.status(400).send({
        success: false,
        message: "Seat already booked for today",
      });
    }

    const booking = await bookingModel.create({
      studentId,
      busId,
      seatNumber,
      pickupStop,
      dropStop,
      date: today,
      status: "pending",
      attendance: "not_marked",
      finalized: false
    });

    return res.status(201).send({
      success: true,
      message: "Seat booking request sent to driver",
      booking,
    });

  } catch (error) {
    console.error("BOOKING ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "You have already booked a seat today.",
      });
    }

    return res.status(500).send({
      success: false,
      message: "Booking failed",
    });
  }
};
/* ======================================================
   GET BOOKED SEATS (Seat Layout – Today Only)
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
      status: { $in: ["pending", "approved"] }
    });

    return res.status(200).send({
      success: true,
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
   DRIVER – GET TODAY BOOKINGS
====================================================== */
export const getDriverBookings = async (req, res) => {
  try {
    const { busId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const bookings = await bookingModel
      .find({
        busId,
        date: { $gte: today, $lt: tomorrow },
        finalized: false
      })
      .populate("studentId", "name email");

    return res.status(200).send({
      success: true,
      bookings,
    });

  } catch (error) {
    console.error("DRIVER BOOKINGS ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

/* ======================================================
   DRIVER – APPROVE / REJECT BOOKING
====================================================== */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await bookingModel.findById(id);

    if (!booking) {
      return res.status(404).send({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.finalized) {
      return res.status(400).send({
        success: false,
        message: "Already finalized",
      });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).send({
      success: true,
      message: "Booking status updated",
    });

  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to update status",
    });
  }
};

/* ======================================================
   DRIVER – MARK ATTENDANCE
====================================================== */
/* ======================================================
   DRIVER – MARK ATTENDANCE (Updated)
====================================================== */
export const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance } = req.body;

    // 1. Safety Check: If the ID isn't a valid MongoDB ObjectId
    // (This happens if the student exists on the bus but hasn't booked a seat yet)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "No active booking found. Please use 'Manual Boarding' for this student.",
      });
    }

    const booking = await bookingModel.findById(id);

    if (!booking) {
      return res.status(404).send({
        success: false,
        message: "Booking record not found",
      });
    }

    // 2. Prevent changes after the trip is submitted to Admin
    if (booking.finalized) {
      return res.status(400).send({
        success: false,
        message: "Attendance is already finalized and cannot be changed",
      });
    }

    booking.attendance = attendance;
    await booking.save();

    return res.status(200).send({
      success: true,
      message: `Student marked as ${attendance}`,
    });

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to update attendance",
    });
  }
};

/* ======================================================
   DRIVER – SUBMIT FINAL ATTENDANCE
====================================================== */
/* ======================================================
   DRIVER – SUBMIT FINAL (Handles Approved + No-Shows)
====================================================== */
export const submitFinalAttendance = async (req, res) => {
  try {
    const { busId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Finalize EVERY booking for this bus today (Approved, Pending, or Rejected)
    // 🔥 CHANGE: Removed 'status: "approved"' so that ALL records get locked
    await bookingModel.updateMany(
      { busId, date: today, finalized: false },
      { finalized: true }
    );

    // 2. Identify students who never booked
    const allAssigned = await userModel.find({ busId, role: "student" });
    const todayBookings = await bookingModel.find({ busId, date: today });
    const bookedIds = todayBookings.map(b => b.studentId.toString());

    const noShowStudents = allAssigned.filter(s => !bookedIds.includes(s._id.toString()));

    // 3. Create 'Absent' records for the no-shows
    if (noShowStudents.length > 0) {
      const absentEntries = noShowStudents.map((student, index) => ({
        studentId: student._id,
        busId,
        seatNumber: -(index + 1), 
        pickupStop: 'No Booking',
        dropStop: 'No Booking',
        date: today,
        status: 'rejected',
        attendance: 'absent',
        finalized: true
      }));

      await bookingModel.insertMany(absentEntries, { ordered: false });
    }

    return res.status(200).send({
      success: true,
      message: "Trip finalized successfully."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).send({
        success: true,
        message: "Attendance was already finalized."
      });
    }
    console.error("FINAL SUBMIT ERROR:", error);
    return res.status(500).send({ success: false, message: "Failed to submit" });
  }
};
/* ======================================================
   ADMIN – GET FINALIZED ATTENDANCE
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
        finalized: true
      })
      .populate("studentId", "name email");

    return res.status(200).send({
      success: true,
      count: bookings.length,
      attendance: bookings,
    });

  } catch (error) {
    console.error("ADMIN ATTENDANCE ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};


export const getMyBooking = async (req, res) => {
  try {
    const { busId } = req.params;
    const studentId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const booking = await bookingModel.findOne({
      studentId,
      busId,
      date: { $gte: today, $lt: tomorrow }
    });

    res.status(200).send({
      success: true,
      booking
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch booking"
    });
  }
};


export const driverAddStudent = async (req, res) => {
  try {
    const { busId } = req.params;
    const { studentId, seatNumber, pickupStop, dropStop } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if seat already used
    const seatTaken = await bookingModel.findOne({
      busId,
      seatNumber,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ["pending", "approved"] }
    });

    if (seatTaken) {
      return res.status(400).send({
        success: false,
        message: "Seat already taken"
      });
    }

    const booking = await bookingModel.create({
      studentId,
      busId,
      seatNumber,
      pickupStop,
      dropStop,
      date: today,
      status: "approved",          // auto-approved
      attendance: "present",       // default present
      finalized: false
    });

    res.status(201).send({
      success: true,
      booking
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to add student"
    });
  }
};


/* ======================================================
   DRIVER – GET UNIFIED MANIFEST (Roster + Bookings)
====================================================== */
export const getUnifiedManifest = async (req, res) => {
  try {
    const { busId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const roster = await userModel.find({ busId, role: "student" }).select("name email");

    const activeBookings = await bookingModel.find({
      busId,
      date: { $gte: today, $lt: tomorrow }
    });

    const manifest = roster.map(student => {
      const booking = activeBookings.find(b => b.studentId.toString() === student._id.toString());
      
      return {
        studentId: student,
        hasBooked: !!booking,
        bookingId: booking ? booking._id : null,
        seatNumber: booking ? booking.seatNumber : "N/A",
        status: booking ? booking.status : "no-booking",
        attendance: booking ? booking.attendance : "absent",
        pickupStop: booking ? booking.pickupStop : "N/A",
        // 🔥 THIS IS THE ONLY LINE YOU WERE MISSING:
        finalized: booking ? booking.finalized : false 
      };
    });

    return res.status(200).send({
      success: true,
      manifest,
    });

  } catch (error) {
    console.error("MANIFEST ERROR:", error);
    return res.status(500).send({ success: false, message: "Failed to fetch manifest" });
  }
};