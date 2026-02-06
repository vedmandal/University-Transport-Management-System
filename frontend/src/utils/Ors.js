
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export const getRouteFromORS = async (start, end) => {
  const res = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      method: "POST",
      headers: {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat], // ORS uses lng, lat
          [end.lng, end.lat]
        ]
      })
    }
  );

  return res.json();
};
