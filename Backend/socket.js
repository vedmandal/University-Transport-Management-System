import BusModel from "./models/bus.model.js";
import userModel from "./models/user.model.js";
import jwt from "jsonwebtoken";

export const socketHandler = (io) => {

  /* ===================================================
     SOCKET AUTH (JWT VERIFY)
  =================================================== */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* -------------------------------
       JOIN BUS ROOM (Students)
    -------------------------------- */
    socket.on("joinBus", (busId) => {
      if (!busId) {
        console.log("joinBus called with invalid busId");
        return;
      }

      socket.join(busId);
      console.log("Joined bus room:", busId);
    });

    /* -------------------------------
       SECURE PARENT JOIN
    -------------------------------- */
    socket.on("joinParentBus", async () => {
      try {
        const parentId = socket.user.id;

        const student = await userModel.findOne({
          parentId,
          role: "student"
        });

        if (!student || !student.busId) {
          console.log("Parent has no linked student or bus");
          return;
        }

        const busRoom = student.busId.toString();
        socket.join(busRoom);

        console.log("Parent joined bus room:", busRoom);

      } catch (error) {
        console.log("Parent join error:", error.message);
      }
    });

    /* -------------------------------
       JOIN ADMIN ROOM
    -------------------------------- */
    socket.on("joinAdmin", () => {
      socket.join("admins");
      console.log("Admin joined admin room");
    });

    /* ===================================================
       🔥 DRIVER SENDS LOCATION
       ✅ NOW AUTO STARTS TRIP IF NOT ACTIVE
    =================================================== */
    socket.on("sendLocation", async ({ busId, lat, lng }) => {
      if (!busId || lat == null || lng == null) {
        console.log("Invalid location payload:", { busId, lat, lng });
        return;
      }

      try {
        const bus = await BusModel.findById(busId);

        if (!bus) return;

        /* ✅ ADDED: AUTO START TRIP */
        if (bus.tripStatus !== "active") {
          bus.tripStatus = "active";
          await bus.save();

          io.to(busId).emit("tripStatusUpdate", {
            status: "active"
          });

          console.log("Trip started automatically:", busId);
        }

        /* UPDATE LOCATION */
        bus.lastLocation = { lat, lng };
        bus.lastUpdatedAt = new Date();
        await bus.save();

      } catch (err) {
        console.error("Failed to save last location:", err.message);
      }

      /* SEND LIVE UPDATE */
      io.to(busId).emit("receiveLocation", { lat, lng });

      io.to("admins").emit("adminReceiveLocation", {
        busId,
        lat,
        lng,
      });
    });

    /* ===================================================
       🔥 ADDED: END TRIP EVENT
    =================================================== */
    socket.on("endTrip", async (busId) => {
      try {
        await BusModel.findByIdAndUpdate(busId, {
          tripStatus: "completed"
        });

        io.to(busId).emit("tripStatusUpdate", {
          status: "completed"
        });

        console.log("Trip ended:", busId);

      } catch (error) {
        console.log("End trip error:", error.message);
      }
    });

    /* -------------------------------
       DISCONNECT
    -------------------------------- */
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, "Reason:", reason);
    });

  });
};