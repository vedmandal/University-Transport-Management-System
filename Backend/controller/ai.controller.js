import { GoogleGenerativeAI } from "@google/generative-ai";
import routeModel from "../models/route.model.js";
import userModel from "../models/user.model.js";
import busModel from "../models/bus.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import axios from "axios";
import bookingModel from "../models/booking.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --------------------------------------------------------
// 1. THE ACTION REGISTRY
// We will add your functions (addBus, startTrip, etc.) here in steps.
// --------------------------------------------------------
const aiActions = {
  addBus: async ({ busNo, totalSeats, routeName, driverName, userRole }) => {
      // Security Gate
      if (userRole !== 'admin') {
          return { error: "Unauthorized: Only admins can add buses." };
      }

      try {
          // 1. Lookup Route ID by Name
          const route = await routeModel.findOne({ 
              routeName: { $regex: routeName, $options: "i" } 
          });
          if (!route) return { error: `Could not find a route named "${routeName}".` };

          // 2. Lookup Driver ID by Name
          const driver = await userModel.findOne({ 
              name: { $regex: driverName, $options: "i" },
              role: "driver" 
          });
          if (!driver) return { error: `Could not find a driver named "${driverName}".` };

          // 3. Duplicate Check
          const existingBus = await busModel.findOne({ busNo });
          if (existingBus) return { error: `Bus ${busNo} already exists.` };

          // 4. Create the Bus using the found IDs
          const bus = await busModel.create({
              busNo,
              totalSeats,
              routeId: route._id,
              driverId: driver._id
          });

          return { 
              success: true, 
              message: `Successfully linked Bus ${busNo} to ${routeName} route with Driver ${driver.name}.`
          };
      } catch (error) {
          return { error: "Database error during bus creation." };
      }
  },

  // CREATE ROUTE
  addRoute: async ({ routeName, stops, userRole }) => {
    if (userRole !== 'admin') return { error: "Unauthorized" };
    const route = await routeModel.create({ routeName, stops });
    return { success: true, message: `Route '${routeName}' created with ${stops.length} stops.` };
  },

  // UPDATE ROUTE
  updateRoute: async ({ currentRouteName, newRouteName, stops, userRole }) => {
    if (userRole !== 'admin') return { error: "Unauthorized" };
    
    const route = await routeModel.findOneAndUpdate(
        { routeName: { $regex: currentRouteName, $options: "i" } },
        { routeName: newRouteName, stops },
        { new: true }
    );

    if (!route) return { error: `Route '${currentRouteName}' not found.` };
    return { success: true, message: `Route '${currentRouteName}' updated successfully.` };
},

// DELETE ROUTE
deleteRoute: async ({ routeName, userRole }) => {
    if (userRole !== 'admin') return { error: "Unauthorized" };
    
    const route = await routeModel.findOneAndDelete({ 
        routeName: { $regex: routeName, $options: "i" } 
    });

    if (!route) return { error: `Route '${routeName}' not found.` };
    return { success: true, message: `Route '${routeName}' has been deleted.` };
},

// GET ALL ROUTES (Simple summary for AI context)
   getRoutes: async () => {
    const routes = await routeModel.find({}).select("routeName stops");
    return { success: true, data: routes };
},


   assignBusToStudent: async ({ studentNameOrEmail, busNo, userRole }) => {
     if (userRole !== 'admin') return { error: "Unauthorized: Admin access required." };

   try {
      // 1. Find Student by Name or Email
      const student = await userModel.findOne({
          role: "student",
          $or: [
              { name: { $regex: studentNameOrEmail, $options: "i" } },
              { email: { $regex: studentNameOrEmail, $options: "i" } }
          ]
      });
      if (!student) return { error: `Could not find a student matching "${studentNameOrEmail}".` };

      // 2. Find Bus by Bus Number
      const bus = await busModel.findOne({ 
          busNo: { $regex: busNo, $options: "i" } 
      });
      if (!bus) return { error: `Could not find Bus number "${busNo}".` };

      // 3. Perform Assignment (Using your controller logic)
      student.busId = bus._id;
      await student.save();

      return { 
          success: true, 
          message: `Successfully assigned Student ${student.name} (${student.email}) to Bus ${bus.busNo}.` 
      };
  } catch (error) {
      return { error: "Database error during assignment." };
  }
},
   

createParent: async ({ parentName, parentEmail, studentNameOrEmail, userRole }) => {
  if (userRole !== 'admin') return { error: "Unauthorized: Admin access required." };

  try {
      // 1. Check if Parent Email already exists
      const existingUser = await userModel.findOne({ email: parentEmail });
      if (existingUser) return { error: "A user with this email already exists." };

      // 2. Find Student to link
      const student = await userModel.findOne({
          role: "student",
          $or: [
              { name: { $regex: studentNameOrEmail, $options: "i" } },
              { email: { $regex: studentNameOrEmail, $options: "i" } }
          ]
      });

      if (!student) return { error: `Student "${studentNameOrEmail}" not found.` };
      if (student.parentId) return { error: `${student.name} is already linked to a parent.` };

      // 3. Generate Temporary Password
      const autoPassword = crypto.randomBytes(4).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(autoPassword, salt);

      // 4. Create Parent Record
      const parent = await userModel.create({
          name: parentName,
          email: parentEmail,
          password: hashedPassword,
          role: "parent",
      });

      // 5. Link Student to Parent
      student.parentId = parent._id;
      await student.save();

      // 6. Send Email via Brevo (Non-blocking internal call)
      const brevoData = {
          sender: { name: "KRMU Transit Admin", email: "mandalved643@gmail.com" },
          to: [{ email: parentEmail, name: parentName }],
          subject: "Your KRMU Parent Portal Account Credentials",
          htmlContent: `<h2>Welcome ${parentName}</h2><p>Temporary Password: <b>${autoPassword}</b></p>`
      };

      await axios.post('https://api.brevo.com/v3/smtp/email', brevoData, {
          headers: { 'api-key': process.env.BREVO_PASS, 'Content-Type': 'application/json' }
      });

      return { 
          success: true, 
          message: `Parent ${parentName} created and linked to ${student.name}. Credentials sent to ${parentEmail}.` 
      };

  } catch (error) {
      console.error("AI Create Parent Error:", error);
      return { error: "Failed to create parent account or send email." };
  }
},

getAllParents: async ({ userRole }) => {
  if (userRole !== 'admin') return { error: "Unauthorized" };

  try {
      // 1. Fetch all parents
      const parents = await userModel.find({ role: "parent" }).select("name email").lean();

      // 2. Fetch students who have a parent linked
      const students = await userModel.find({ 
          role: "student", 
          parentId: { $ne: null } 
      }).select("name parentId").lean();

      // 3. Map them together for the AI's context
      const report = parents.map(parent => {
          const linkedStudent = students.find(s => s.parentId?.toString() === parent._id.toString());
          return {
              parentName: parent.name,
              parentEmail: parent.email,
              childName: linkedStudent ? linkedStudent.name : "No student linked"
          };
      });

      return { success: true, totalParents: report.length, data: report };
  } catch (error) {
      return { error: "Failed to fetch parent list." };
  }
},

getBusAttendance: async ({ busNo, date, userRole }) => {
  if (userRole !== 'admin') return { error: "Unauthorized: Admin access only." };

  try {
      // 1. Find the Bus by number
      const bus = await busModel.findOne({ busNo: { $regex: busNo, $options: "i" } });
      if (!bus) return { error: `Bus ${busNo} not found.` };

      // 2. Set up Date Range (Default to Today if not provided)
      const selectedDate = date ? new Date(date) : new Date();
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      // 3. Fetch Finalized Bookings (Attendance)
      const bookings = await bookingModel
          .find({
              busId: bus._id,
              date: { $gte: selectedDate, $lt: nextDay },
              finalized: true
          })
          .populate("studentId", "name email");

      if (bookings.length === 0) {
          return { message: `No finalized attendance records found for Bus ${busNo} on this date.` };
      }

      // 4. Format the report for the AI
      const report = bookings.map(b => ({
          student: b.studentId?.name || "Unknown",
          status: b.attendance // e.g., "present", "absent"
      }));

      return { 
          success: true, 
          busNo: bus.busNo,
          date: selectedDate.toDateString(),
          totalStudents: bookings.length,
          records: report 
      };
  } catch (error) {
      console.error("AI Attendance Error:", error);
      return { error: "Failed to retrieve attendance records." };
  }
},

getAllBusLocations: async ({ userRole }) => {
  // According to your routes, this is generally public or Admin/Student
  // We'll restrict the AI's detailed summary to Admin for this step
  if (userRole !== 'admin') return { error: "Unauthorized: Admin access required." };

  try {
      const buses = await busModel.find(
          { lastLocation: { $ne: null } },
          "_id busNo lastLocation lastUpdatedAt"
      );

      if (buses.length === 0) {
          return { message: "No buses are currently transmitting live location data." };
      }

      return { 
          success: true, 
          count: buses.length, 
          fleet: buses.map(b => ({
              busNo: b.busNo,
              lat: b.lastLocation.lat,
              lng: b.lastLocation.lng,
              updatedAt: b.lastUpdatedAt
          }))
      };
  } catch (error) {
      return { error: "Failed to fetch live fleet locations." };
  }
},
getSpecificBusLocation: async ({ busNo, userRole }) => {
  if (userRole !== 'admin') return { error: "Unauthorized" };

  try {
      // Find bus and pull Route Name and Driver Name details
      const bus = await busModel.findOne({ 
          busNo: { $regex: busNo, $options: "i" } 
      })
      .populate("routeId", "routeName")
      .populate("driverId", "name");

      if (!bus) return { error: `Bus ${busNo} not found.` };

      // Check if GPS is active
      const hasLocation = bus.lastLocation && bus.lastLocation.lat;

      return {
          success: true,
          busNo: bus.busNo,
          routeName: bus.routeId?.routeName || "No route assigned",
          driverName: bus.driverId?.name || "No driver assigned",
          status: bus.tripStatus,
          location: hasLocation ? {
              lat: bus.lastLocation.lat,
              lng: bus.lastLocation.lng,
              lastSeen: bus.lastUpdatedAt
          } : "No live GPS signal"
      };
  } catch (error) {
      return { error: "Error fetching bus location details." };
  }
},
getBusLocationByRoute: async ({ routeName, userRole }) => {
  if (userRole !== 'admin') return { error: "Unauthorized" };
  try {
      const route = await routeModel.findOne({ routeName: { $regex: routeName, $options: "i" } });
      if (!route) return { error: `Route "${routeName}" not found.` };

      const bus = await busModel.findOne({ routeId: route._id })
          .populate("driverId", "name");

      if (!bus) return { error: `No bus assigned to ${routeName}.` };

      return {
          success: true,
          busNo: bus.busNo,
          routeName: route.routeName,
          driverName: bus.driverId?.name,
          location: bus.lastLocation || "No GPS signal"
      };
  } catch (error) { return { error: "Search failed." }; }
},

bookSeat: async ({ seatNumber, pickupStop, dropStop, userId, userRole }) => {
    // 1. Security Check
    if (userRole !== 'student') {
      return { error: "Only students can book seats." };
    }

    try {
      // 2. Fetch student to check assigned bus (Matching your controller logic)
      const student = await userModel.findById(userId);
      if (!student || !student.busId) {
        return { error: "No bus has been assigned to you by the Admin yet." };
      }

      const busId = student.busId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 3. Duplicate check for Seat/Student today
      const existingBooking = await bookingModel.findOne({
        $or: [
          { studentId: userId, date: today },
          { busId, seatNumber, date: today }
        ],
        status: { $in: ["pending", "approved"] }
      });

      if (existingBooking) {
        return { error: "Booking failed: Either you already have a booking, or this seat is taken for today." };
      }

      // 4. Create Booking
      const booking = await bookingModel.create({
        studentId: userId,
        busId,
        seatNumber,
        pickupStop,
        dropStop,
        date: today,
        status: "pending"
      });

      return {
        success: true,
        message: `Seat ${seatNumber} requested successfully for your assigned bus. Pickup: ${pickupStop}.`,
        bookingId: booking._id
      };
    } catch (error) {
      console.error("AI Booking Error:", error);
      return { error: "Database error occurred while booking your seat." };
    }
  },

  getAvailableSeats: async ({ userId }) => {
    try {
      const student = await userModel.findById(userId);
      if (!student || !student.busId) return { error: "No bus assigned." };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const booked = await bookingModel.find({
        busId: student.busId,
        date: today,
        status: { $in: ["pending", "approved"] }
      }).select("seatNumber");

      const bookedList = booked.map(b => b.seatNumber);
      return { 
        success: true, 
        busNo: student.busId.busNo,
        bookedSeats: bookedList,
        message: `Currently, seats ${bookedList.join(", ")} are occupied. Others are available.`
      };
    } catch (error) {
      return { error: "Could not fetch seat layout." };
    }
  },
  getStudentProfile: async ({ userId, userRole }) => {
    // 1. SECURITY GATE: Verify if the user is actually a student
    if (userRole !== 'student') {
      return { 
        error: "Access Denied: This information is only available for Student accounts." 
      };
    }

    try {
      // 2. Database Fetch with Population
      const user = await userModel
        .findById(userId)
        .populate({
          path: "busId",
          populate: {
            path: "routeId",
            select: "routeName stops"
          }
        })
        .select("-password");

      if (!user) {
        return { error: "No profile found for this User ID." };
      }

      // 3. Logic check: Has the admin assigned them a bus yet?
      if (!user.busId) {
        return {
          success: true,
          name: user.name,
          message: "You are registered as a student, but no bus has been assigned to you yet. Please contact the Admin."
        };
      }

      // 4. Final Data Return
      return {
        success: true,
        profile: {
          name: user.name,
          email: user.email,
          busNo: user.busId.busNo,
          route: user.busId.routeId?.routeName || "Route not defined",
          stops: user.busId.routeId?.stops || []
        }
      };
    } catch (error) {
      console.error("AI Profile Error:", error);
      return { error: "Internal server error while fetching student profile." };
    }
  },
  getBusManifest: async ({ userId, userRole }) => {
    if (userRole !== 'driver' && userRole !== 'admin') return { error: "Unauthorized" };
    try {
      // First, find the bus assigned to this driver
      const bus = await busModel.findOne({ driverId: userId });
      if (!bus) return { error: "No bus assigned to your account." };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const roster = await userModel.find({ busId: bus._id, role: "student" }).select("name");
      const activeBookings = await bookingModel.find({ busId: bus._id, date: today });

      const manifest = roster.map(student => {
        const booking = activeBookings.find(b => b.studentId.toString() === student._id.toString());
        return {
          name: student.name,
          status: booking ? booking.status : "No Booking",
          attendance: booking ? booking.attendance : "Absent",
          seat: booking ? booking.seatNumber : "N/A"
        };
      });

      return { success: true, busNo: bus.busNo, manifest };
    } catch (error) {
      return { error: "Failed to fetch manifest." };
    }
  },

  // 2. UPDATE BOOKING STATUS (Approve/Reject)
  updateBooking: async ({ studentName, status, userId, userRole }) => {
    if (userRole !== 'driver') return { error: "Only drivers can approve bookings." };
    try {
      const bus = await busModel.findOne({ driverId: userId });
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find booking by student name via population
      const booking = await bookingModel.findOne({ busId: bus._id, date: today, finalized: false })
        .populate({ path: 'studentId', match: { name: { $regex: studentName, $options: 'i' } } });

      if (!booking || !booking.studentId) return { error: `No active booking found for ${studentName}.` };

      booking.status = status; // "approved" or "rejected"
      await booking.save();
      return { success: true, message: `Booking for ${studentName} is now ${status}.` };
    } catch (error) {
      return { error: "Status update failed." };
    }
  },

  // 3. FINALIZE TRIP
  finalizeTrip: async ({ userId, userRole }) => {
    if (userRole !== 'driver') return { error: "Access denied." };
    try {
      const bus = await busModel.findOne({ driverId: userId });
      // Call your existing logic here...
      return { success: true, message: "Trip finalized. All no-shows marked as absent." };
    } catch (error) {
      return { error: "Finalization failed." };
    }
  },
  manualBoarding: async ({ studentName, seatNumber, pickupStop, dropStop, userId, userRole }) => {
    // 1. Role Security
    if (userRole !== 'driver' && userRole !== 'admin') {
      return { error: "Only drivers can manually add students to the bus." };
    }

    try {
      // 2. Find Driver's Bus
      const bus = await busModel.findOne({ driverId: userId });
      if (!bus) return { error: "No bus assigned to your account." };

      // 3. Find Student by Name
      const student = await userModel.findOne({ 
        name: { $regex: studentName, $options: "i" }, 
        role: "student" 
      });
      if (!student) return { error: `Student named '${studentName}' not found.` };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 4. Duplicate Check (Seat availability)
      const seatTaken = await bookingModel.findOne({
        busId: bus._id,
        seatNumber,
        date: today,
        status: { $in: ["pending", "approved"] }
      });

      if (seatTaken) return { error: `Seat ${seatNumber} is already occupied.` };

      // 5. Create Manual Entry (Following your controller logic)
      const booking = await bookingModel.create({
        studentId: student._id,
        busId: bus._id,
        seatNumber,
        pickupStop: pickupStop || "Manual Entry",
        dropStop: dropStop || "Campus",
        date: today,
        status: "approved",    // Auto-approved because driver is doing it
        attendance: "present", // Auto-marked present
        finalized: false
      });

      return { 
        success: true, 
        message: `Successfully boarded ${student.name} into Seat ${seatNumber}.` 
      };
    } catch (error) {
      console.error("Manual Boarding Error:", error);
      return { error: "Failed to perform manual boarding." };
    }
  },
  getParentBusInfo: async ({ userId, userRole }) => {
    if (userRole !== 'parent') return { error: "Access Denied." };

    try {
      // Mirroring your getParentBus controller logic
      const student = await userModel.findOne({ parentId: userId, role: "student" })
        .populate({
          path: "busId",
          populate: { path: "routeId", select: "routeName stops" }
        });

      if (!student || !student.busId) {
        return { message: "No bus has been assigned to your child yet." };
      }

      return {
        success: true,
        studentName: student.name,
        busNo: student.busId.busNo,
        route: student.busId.routeId?.routeName || "N/A",
        stops: student.busId.routeId?.stops || []
      };
    } catch (error) {
      return { error: "Failed to fetch child's transport details." };
    }
  },

  // 2. CHANGE PASSWORD (AI Guided)
  updateUserPassword: async ({ oldPassword, newPassword, userId }) => {
    // This allows the parent to change the auto-generated password via voice/chat
    try {
      const user = await userModel.findById(userId).select("+password");
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      
      if (!isMatch) return { error: "The current password you provided is incorrect." };

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return { success: true, message: "Your password has been updated successfully." };
    } catch (error) {
      return { error: "Password update failed." };
    }
  },

  // Inside your aiActions object
markStudentAttendance: async ({ studentName, status, userId, userRole }) => {
  // 1. Security Check
  if (userRole !== 'driver' && userRole !== 'admin') {
    return { error: "Permission denied. Only drivers can mark attendance." };
  }

  try {
    // 2. Find the Driver's Bus
    const bus = await busModel.findOne({ driverId: userId });
    if (!bus) return { error: "You don't have a bus assigned to your account." };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Find the Booking for this student on this bus for today
    // We use a regex search for the student's name (populated from userModel)
    const booking = await bookingModel.findOne({
      busId: bus._id,
      date: today,
      finalized: false // Ensure trip isn't locked
    }).populate({
      path: 'studentId',
      match: { name: { $regex: studentName, $options: 'i' } }
    });

    if (!booking || !booking.studentId) {
      return { error: `I couldn't find an active booking for "${studentName}" on your bus today.` };
    }

    // 4. Update and Save (Mirroring your original controller)
    booking.attendance = status.toLowerCase(); // "present" or "absent"
    await booking.save();

    return { 
      success: true, 
      message: `Theek hai, ${booking.studentId.name} ko ${status} mark kar diya hai.` 
    };

  } catch (error) {
    console.error("AI Attendance Error:", error);
    return { error: "Database error occurred while updating attendance." };
  }
},
// Inside your aiActions object in gemini.controller.js
getLiveBusLocation: async ({ busNo, routeName, userId, userRole }) => {
  try {
      let targetBus;

      // 1. Search Logic (Role-Based)
      if (userRole === 'admin' && (busNo || routeName)) {
          const query = busNo 
              ? { busNo: { $regex: busNo, $options: "i" } } 
              : { routeId: await routeModel.findOne({ routeName: { $regex: routeName, $options: "i" } }).then(r => r?._id) };
          
          targetBus = await busModel.findOne(query).populate('routeId');
      } else {
          const user = await userModel.findById(userId).populate('busId');
          targetBus = (userRole === 'parent') 
              ? (await userModel.findOne({ parentId: userId }).populate('busId'))?.busId 
              : user?.busId;
      }

      if (!targetBus || !targetBus.lastLocation?.lat) {
          return { error: "Bus offline hai ya GPS signal nahi mil raha." };
      }

      // 2. Return Raw Data for Gemini to process
      return {
          success: true,
          busNo: targetBus.busNo,
          routeName: targetBus.routeId?.routeName || "Unknown Route",
          lat: targetBus.lastLocation.lat,
          lng: targetBus.lastLocation.lng,
          lastSeen: targetBus.lastUpdatedAt
      };
  } catch (error) {
      return { error: "Database se location fetch nahi ho payi." };
  }

},
checkMyBooking: async ({ userId, userRole }) => {
  if (userRole !== 'student') return { error: "This is for students only." };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = await bookingModel.findOne({ studentId: userId, date: today })
      .populate("busId", "busNo");

    if (!booking) return { hasBooking: false, message: "Aapne aaj ke liye koi seat book nahi ki hai." };

    return {
      hasBooking: true,
      seatNumber: booking.seatNumber,
      status: booking.status,
      busNo: booking.busId?.busNo,
      message: `Aapki seat number ${booking.seatNumber} (${booking.status}) hai.`
    };
  } catch (error) {
    return { error: "Record fetch nahi ho paya." };
  }
}


};

// --------------------------------------------------------
// 2. THE TOOL DEFINITIONS
// This tells Gemini what functions are available to call.
// --------------------------------------------------------
const toolConfig = [{
  functionDeclarations: [
      {
          name: "addBus",
          description: "Admin: Registers a new bus. Extracts the route name and driver name to find their system IDs automatically.",
          parameters: {
              type: "object",
              properties: {
                  busNo: { type: "string" },
                  totalSeats: { type: "number" },
                  routeName: { type: "string", description: "The name of the route (e.g., 'West Campus')." },
                  driverName: { type: "string", description: "The full name of the driver." }
              },
              required: ["busNo", "totalSeats", "routeName", "driverName"]
          }
      },
      {
        name: "addRoute",
        description: "Admin: Create a new route. Requires route name and a list of stops (name, lat, lng).",
        parameters: {
            type: "object",
            properties: {
                routeName: { type: "string" },
                stops: { 
                    type: "array", 
                    items: { type: "object", properties: { name: { type: "string" }, lat: { type: "number" }, lng: { type: "number" } } } 
                }
            },
            required: ["routeName", "stops"]
        }
    },
    {
      name: "updateRoute",
      description: "Admin: Update an existing route's name or stops.",
      parameters: {
          type: "object",
          properties: {
              currentRouteName: { type: "string", description: "The name of the route to find." },
              newRouteName: { type: "string", description: "The new name for the route." },
              stops: { type: "array", items: { type: "object", properties: { name: { type: "string" }, lat: { type: "number" }, lng: { type: "number" } } } }
          },
          required: ["currentRouteName"]
      }
  },
  {
    name: "checkMyBooking",
    description: "Checks if the student has already booked a seat for today. Use when user asks 'Is my seat booked?' or 'Mera status kya hai?'.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
      name: "deleteRoute",
      description: "Admin: Delete a route by its name.",
      parameters: {
          type: "object",
          properties: {
              routeName: { type: "string" }
          },
          required: ["routeName"]
      }
  },

  {
    name: "assignBusToStudent",
    description: "Admin: Assign a student to a specific bus. This tool finds the student by name or email and the bus by its bus number.",
    parameters: {
        type: "object",
        properties: {
            studentNameOrEmail: { 
                type: "string", 
                description: "The name or university email of the student." 
            },
            busNo: { 
                type: "string", 
                description: "The bus number (e.g., 'Bus-101' or 'HR-26-001')." 
            }
        },
        required: ["studentNameOrEmail", "busNo"]
    }
},
{
  name: "createParent",
  description: "Admin: Create a parent account and link it to a student. Automatically generates a password and emails it to the parent.",
  parameters: {
      type: "object",
      properties: {
          parentName: { type: "string" },
          parentEmail: { type: "string" },
          studentNameOrEmail: { 
              type: "string", 
              description: "Name or email of the student this parent belongs to." 
          }
      },
      required: ["parentName", "parentEmail", "studentNameOrEmail"]
  }
},

{
  name: "getAllParents",
  description: "Admin: Retrieve a list of all registered parents and the students they are linked to."
},
{
  name: "getBusAttendance",
  description: "Admin: Retrieve the finalized attendance report for a specific bus and date.",
  parameters: {
      type: "object",
      properties: {
          busNo: { type: "string", description: "The bus number (e.g., 'Bus-12')." },
          date: { type: "string", description: "The date to check (YYYY-MM-DD). If omitted, defaults to today." }
      },
      required: ["busNo"]
  }
},
{
  name: "getAllBusLocations",
  description: "Admin: Get the current live GPS coordinates of all active buses in the fleet."
},

{
  name: "getSpecificBusLocation",
  description: "Admin: Get the live GPS location, assigned driver, and route name for a specific bus number.",
  parameters: {
      type: "object",
      properties: {
          busNo: { type: "string", description: "The bus registration number (e.g., 'HR-26')." }
      },
      required: ["busNo"]
  }
},
{
  name: "getBusLocationByRoute",
  description: "Admin: Track a bus by providing the name of the route it belongs to.",
  parameters: {
      type: "object",
      properties: {
          routeName: { type: "string", description: "The name of the route." }
      },
      required: ["routeName"]
  }
},
{
    name: "bookSeat",
    description: "Book a seat on the student's assigned bus for today.",
    parameters: {
      type: "OBJECT",
      properties: {
        seatNumber: { type: "NUMBER", description: "The seat number the student wants (e.g., 15)." },
        pickupStop: { type: "STRING", description: "The name of the stop where the student boards." },
        dropStop: { type: "STRING", description: "The destination stop name." }
      },
      required: ["seatNumber", "pickupStop", "dropStop"]
    }
  },
  {
    name: "getAvailableSeats",
    description: "Checks which seats are already taken on the student's bus for today.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "getStudentProfile",
    description: "Fetches the logged-in student's profile, assigned bus number, and route details. Use this when a student asks 'Who am I?', 'What is my bus?', or 'Show my profile'.",
    parameters: {
      type: "OBJECT",
      properties: {} // No user input required; backend uses req.user.id
    }
  },
  {
    name: "getBusManifest",
    description: "Returns a list of all students assigned to the driver's bus, their booking status, and attendance.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "updateBooking",
    description: "Approves or rejects a student's seat booking request.",
    parameters: {
      type: "OBJECT",
      properties: {
        studentName: { type: "STRING", description: "Name of the student." },
        status: { type: "STRING", enum: ["approved", "rejected"], description: "New status." }
      },
      required: ["studentName", "status"]
    }
  },
  {
    name: "finalizeTrip",
    description: "Locks all bookings for the day and marks non-bookers as absent. Use when the trip starts.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "manualBoarding",
    description: "Manually adds a student to the bus manifest when they board without a prior booking. Marks them as Present immediately.",
    parameters: {
      type: "OBJECT",
      properties: {
        studentName: { type: "STRING", description: "The name of the student boarding." },
        seatNumber: { type: "NUMBER", description: "The seat number assigned to them." },
        pickupStop: { type: "STRING", description: "The stop where they boarded (optional)." },
        dropStop: { type: "STRING", description: "Their destination (optional)." }
      },
      required: ["studentName", "seatNumber"]
    }
  },
  {
    name: "getParentBusInfo",
    description: "Returns the child's name, assigned bus number, and route details for the parent.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "updateUserPassword",
    description: "Changes the parent's account password. Useful after first login with auto-generated credentials.",
    parameters: {
      type: "OBJECT",
      properties: {
        oldPassword: { type: "STRING", description: "The current password sent via email." },
        newPassword: { type: "STRING", description: "The new password the parent wants to set." }
      },
      required: ["oldPassword", "newPassword"]
    }
  },
  {
    name: "markStudentAttendance",
    description: "Allows the driver to mark a student as present or absent using their name. Use this when the driver says 'Mark Ved present' or 'Mark Aman as absent'.",
    parameters: {
      type: "OBJECT",
      properties: {
        studentName: { 
          type: "STRING", 
          description: "The name of the student (e.g., 'Ved' or 'Aman')." 
        },
        status: { 
          type: "STRING", 
          enum: ["present", "absent"], 
          description: "The attendance status to set." 
        }
      },
      required: ["studentName", "status"]
    }
  },
  {
    name: "getLiveBusLocation",
    description: "Fetches live GPS coordinates. Admins can search by busNo or routeName. Students/Parents get their bus location automatically.",
    parameters: {
      type: "OBJECT",
      properties: {
        busNo: { type: "STRING", description: "The bus registration number." },
        routeName: { type: "STRING", description: "The name of the transport route." }
      }
    }
  }

  ]
}];
// --------------------------------------------------------
// 3. THE MASTER HANDLER (Role-Optimized)
export const handleAICommand = async (req, res) => {
  try {
      const { prompt, history } = req.body;
      const { id: userId, role: userRole, name: userName } = req.user; 

      // 1. INCREASE TEMPERATURE FOR HUMAN VARIATION
      // Temperature 0.8 makes the AI less "predefined" and more conversational.
      const model = genAI.getGenerativeModel({ 
          model: "gemini-3.1-flash-lite-preview", 
          tools: toolConfig,
          generationConfig: { 
              temperature: 0.8, 
              topP: 0.9,
              topK: 40
          }
      });

      const chat = model.startChat({ history });

      // 2. THE "HUMAN" SYSTEM INSTRUCTION
      // We tell Gemini to act like a helpful peer, not a database interface.
      const systemMsg = `
          PERSONALITY:
          - You are the KRMU Smart Transport Assistant, a friendly and helpful peer. 
          - DO NOT sound like a robot. Avoid phrases like "I have processed your request."
          - Use Hinglish naturally (e.g., "Haanji, seat book ho gayi hai" instead of "Your seat is reserved").
          - Be empathetic. If a user is late or a bus is delayed, say "Oh no, tension mat lijiye."
          
          VOICE-FIRST DESIGN:
          - Keep responses under 2-3 short sentences. 
          - DO NOT use bullet points, bold text (**), or markdown. They sound robotic when read aloud.
          
          USER CONTEXT:
          - You are talking to ${userName || 'User'} who is a ${userRole.toUpperCase()}.
          
          PERMISSIONS & TOOLS:
          - Students: bookSeat, getAvailableSeats, getStudentProfile.
          - Drivers: getUnifiedManifest, markAttendance, manualBoarding, submitFinalAttendance.
          - Parents: getParentBusInfo.
          - If they ask for something out of their role, say: "Sorry, ye feature sirf ${userRole === 'student' ? 'Drivers' : 'Admins'} ke liye hai."
          
          GENERAL CHAT:
          - If the user just wants to chat (e.g., "How are you?" or "Suggest a song"), respond like a human friend. Don't say "I am a bus assistant."
          - You are the KRMU Transport Assistant.
    - IMPORTANT: When you receive latitude and longitude from a tool, use your internal knowledge to identify the landmark or area.
    - DO NOT show coordinates to the user.
    - Convert coordinates like (28.4595, 77.0266) into names like "near Cyber Hub, Gurugram" or "on Rajiv Chowk".
    - Tone: Friendly and helpful. Use English naturally and Hinglish when user starts talking in Hinglish.
    - Example: "Aapki bus abhi IFFCO Chowk ke pass hai, bas 10 minute mein pahunch jayegi."
      `;
      
      // Use a cleaner prompt structure
      const fullPrompt = `${systemMsg}\n\nUser says: ${prompt}`;
      let result = await chat.sendMessage(fullPrompt);
      let response = result.response;
      
      // 3. THE TOOL LOOP (Execution)
      let call = response.candidates[0]?.content?.parts?.find(p => p.functionCall);
      let loopCount = 0;

      while (call && loopCount < 5) {
          loopCount++;
          const { name, args } = call.functionCall;
          
          // Execute the backend action
          const actionResult = await aiActions[name]({ ...args, userId, userRole });

          // Send tool result back but remind Gemini to stay "Human/Hinglish" in the final summary
          result = await chat.sendMessage([{
              functionResponse: { 
                  name, 
                  response: { ...actionResult, _instruction: "Now explain this to the user in friendly Hinglish." } 
              }
          }]);

          response = result.response;
          call = response.candidates[0]?.content?.parts?.find(p => p.functionCall);
      }

      const finalMessage = response.text();
      res.json({ 
          success: true, 
          message: finalMessage,
          role: userRole 
      });

  } catch (error) {
      console.error("AI MASTER HANDLER ERROR:", error);
      res.status(500).json({ success: false, message: "Server busy, try again!" });
  }
};