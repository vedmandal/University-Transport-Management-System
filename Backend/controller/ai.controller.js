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
}

  ]
}];

// --------------------------------------------------------
// 3. THE MASTER HANDLER
// --------------------------------------------------------
// Add this helper at the very top of your file
export const handleAICommand = async (req, res) => {
    try {
      const { prompt, history } = req.body;
      const { id: userId, role: userRole } = req.user;
  
      const model = genAI.getGenerativeModel({ 
        // Use the preview string which is most stable for 2026 Free Tier
        model: "gemini-3-flash-preview", 
        tools: toolConfig 
      });
  
      const chat = model.startChat({ 
        history: history || [],
        generationConfig: {
          temperature: 0.7,
          // IN 2026: MINIMAL thinking level prevents quota exhaustion
          thinkingLevel: "minimal" 
        }
      });
  
      const systemMsg = `Role: KRMU Admin Assistant. Be brief.`;
      let result = await chat.sendMessage(`${systemMsg}\nUser: ${prompt}`);
      let response = result.response;
      
      let call = response.candidates[0]?.content?.parts?.find(p => p.functionCall);
      let loopCount = 0;
  
      while (call && loopCount < 3) {
        loopCount++;
        const { name, args } = call.functionCall;
        const actionResult = await aiActions[name]({ ...args, userId, userRole });
  
        // DELAY: Required for 2026 Free Tier (RPM protection)
        await new Promise(res => setTimeout(res, 2000));
  
        result = await chat.sendMessage([{
          functionResponse: { name, response: actionResult }
        }]);
  
        response = result.response;
        call = response.candidates[0]?.content?.parts?.find(p => p.functionCall);
      }
  
      res.json({ success: true, message: response.text() });
  
    } catch (error) {
      // This logs the specific reason (like 'Model Not Found') in Render logs
      console.error("DEBUG AI ERROR:", error.message); 
      
      res.status(500).json({ 
        success: false, 
        message: "AI Busy. Refresh and try 'Hi' in 30 seconds." 
      });
    }
  };