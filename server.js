const express = require("express");
const app = express();
const cors = require("cors");

// Database connection
const connectDB = require("./config/db");

connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extender: false }));

// Assign PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running at port " + PORT));
