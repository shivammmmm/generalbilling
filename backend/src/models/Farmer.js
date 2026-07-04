import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },

    village: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    aadhaarNumber: {
      type: String,
      trim: true,
      sparse: true,   // null values allowed for multiple farmers
      unique: true,   // but actual values must be unique
      default: null,
    },

    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },

    defaultRateType: {
      type: String,
      enum: ["Rate A", "Rate B", "Rate C"],
      default: "Rate A",
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Farmer = mongoose.model("Farmer", farmerSchema);

export default Farmer;
