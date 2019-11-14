const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema(
  {
    patientName: {
      type: String,
      unique: true,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    medicalHistory: [
      {
        desease: String,
        medications: String,
        date: String
      }
    ],
    dateOfCheckup: {
      type: Array,
      default: []
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Patient", DoctorSchema);
