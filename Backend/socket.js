import BusModel from "./models/bus.model.js";



export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* -------------------------------
       JOIN BUS ROOM
    -------------------------------- */
    socket.on("joinBus", (busId) => {
      if (!busId) {
        console.log("joinBus called with invalid busId");
        return;
      }

      socket.join(busId);
      console.log("Joined bus room:", busId);
    });
    

    socket.on("joinAdmin", () => {
      socket.join("admins");
      console.log("Admin joined admin room");
    });
    
    

    /* -------------------------------
       DRIVER SENDS LOCATION
    -------------------------------- */
    socket.on("sendLocation", async ({ busId, lat, lng }) => {
      if (!busId || lat == null || lng == null) {
        console.log("Invalid location payload:", { busId, lat, lng });
        return;
      }
    
      console.log("Broadcasting location:", busId, lat, lng);
    
      // 🔥 SAVE LAST KNOWN LOCATION IN DB
      try {
        await BusModel.findByIdAndUpdate(busId, {
          lastLocation: { lat, lng },
          lastUpdatedAt: new Date(),
        });
      } catch (err) {
        console.error("Failed to save last location:", err.message);
      }
    
      // 🔥 SEND LIVE UPDATE TO STUDENTS
      socket.to(busId).emit("receiveLocation", { lat, lng });


// 🔥 send to admins
socket.to("admins").emit("adminReceiveLocation", {
  busId,
  lat,
  lng,
});
    });


    

    /* -------------------------------
       DISCONNECT
    -------------------------------- */
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, "Reason:", reason);
    });
  });
};
