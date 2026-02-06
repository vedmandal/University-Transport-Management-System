import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token"
    });
  }
};


export const role = (role) => {
    return (req, res, next) => {
      try {
        if (req.user.role !== role) {
          return res.status(403).send({
            success: false,
            message: "Access denied"
          });
        }
        next();
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Authorization error"
        });
      }
    };
  };
  