const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const DoctorSchema = new Schema(
  {
    doctorName: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    password: {
      type: String,
      required: true
    },
    qualification: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
