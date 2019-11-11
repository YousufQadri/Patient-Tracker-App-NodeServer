const express = require("express");
const app = express();
const cors = require("cors");

const doctor = require("./routes/doctor");

// Database connection
const connectDB = require("./config/db");

connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Routes
app.use("/api/v1/doctor", doctor);

// 404 not found
app.use((req, res) =>
  res.status(404).send({
    message: `API route not found`,
    route: `${req.hostname}${req.url}`
  })
);

// Assign PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running at port " + PORT));
