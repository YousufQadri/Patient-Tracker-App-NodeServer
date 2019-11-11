const mongoos = require("mongoose");
const config = require("config");

const MONGO_URI = process.env.MONGO_URI || config.get("MONGO_URI");

// Database Connection
const connectDB = async () => {
  try {
    await mongoos.connect(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("Unable to connect: ", error.message);
  }
};

module.exports = connectDB;
