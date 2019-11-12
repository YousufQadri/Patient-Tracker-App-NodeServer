const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
// const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const auth = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// create API params schema for validation
const postDoctorApiParamsSchema = Joi.object({
  doctorName: Joi.string().required(),
  password: Joi.string()
    .min(4)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  qualification: Joi.string().required()
});

const postPatienApiParamsSchema = Joi.object({
  patientName: Joi.string().required(),
  age: Joi.number().required()
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
    const { error } = postDoctorApiParamsSchema.validate({
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
        _id: doctor._id
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

// @route    POST api/v1/doctor/login
// @desc     Login doctor
// @access   Public
router.post("/login", async (req, res) => {
  // Destructure email & password
  let { email, password } = req.body;

  // Empty fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }

  // Lowercase email
  email = email.toLowerCase();

  try {
    // Find doctor
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Create JWT
    const payload = {
      doctor: {
        email: doctor.email,
        id: doctor._id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, { expiresIn: "365d" });

    // Send response
    return res.json({
      success: true,
      message: "Logged-in successfully!",
      token,
      email: doctor.email,
      _id: doctor._id
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

// @route    POST api/v1/doctor/add-patient
// @desc     Add Patient
// @access   Private
router.post("/add-patient", auth, async (req, res) => {
  let { patientName, age } = req.body;

  if (!patientName || !age) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }

  // Remove whitespaces
  patientName = patientName.trim();
  const { error } = postPatienApiParamsSchema.validate({
    patientName,
    age
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  try {
    let patient = await new Patient({
      patientName,
      age,
      doctorId: req.doctor.id
    });
    console.log("patient", patient);
    await job.save();
    patient = await patient.populate("doctorId").execPopulate();
    console.log("after populate", patient);
    return res.status(200).json({
      success: true,
      patient,
      message: "Job created!"
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
