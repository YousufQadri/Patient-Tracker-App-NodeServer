const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
// const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
// const auth = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// create API params schema for validation
const postApiParamsSchema = Joi.object({
  doctorName: Joi.string().required(),
  password: Joi.string()
    .min(4)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  qualification: Joi.string().required()
});

// @route    POST api/v1/doctor/register
// @desc     Register doctor
// @access   Public
router.post("/register", async (req, res) => {
  // Destructure data from request body
  let { doctorName, email, password, qualification } = req.body;

  if (!doctorName || !email || !password || !qualification) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }

  // Lowercase email
  email = email.toLowerCase();
  doctorName = doctorName.trim();

  try {
    // validate api params
    const { error } = postApiParamsSchema.validate({
      doctorName,
      email,
      password,
      qualification
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Check if email already exist in DB
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({
        success: false,
        message: "Email already exists!"
      });
    }

    // Create doctor
    doctor = await new Doctor({
      doctorName,
      email,
      password,
      qualification
    });

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Replace plain pass with hash pass
    doctor.password = hash;

    console.log(doctor);
    await doctor.save();

    // create jsonwebtoken
    const payload = {
      doctor: {
        email,
        id: doctor.id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, {
      expiresIn: "365d"
    });

    // Response
    return res.json({
      success: true,
      token,
      doctor,
      message: "Doctor registered successfully"
    });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

module.exports = router;