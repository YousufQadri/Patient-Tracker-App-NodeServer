const jwt = require("jsonwebtoken");
const config = require("config");

const Doctor = require("../models/Doctor");

// Environment variable setup
const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// Doctor Authentication Middleware
const auth = async (req, res, next) => {
  // Grab token from header
  const token = req.header("x-auth-token");

  // Check token existense
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied"
    });
  }

  try {
    // Verify token
    const decoded = await jwt.verify(token, JWT_SECRET);

    // Check doctor in DB
    let userExist = await Doctor.findOne({ _id: decoded.doctor._id });
    if (!userExist) {
      res.status(401).json({
        success: false,
        message: "Invalid token!"
      });
    }

    // Set user object in req body
    req.doctor = decoded.doctor;
    next();
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};
