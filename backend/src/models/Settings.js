import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // ================= SHOP DETAILS =================

    shopName: {
      type: String,
      default: "",
    },

    shopAddress: {
      type: String,
      default: "",
    },

    shopMobile: {
      type: String,
      default: "",
    },

    shopEmail: {
      type: String,
      default: "",
    },



    // ================= GST DETAILS =================

    gstNumber: {
      type: String,
      default: "",
    },

    gstPercentage: {
      type: Number,
      default: 0,
    },



    // ================= BANK DETAILS =================

    bankName: {
      type: String,
      default: "",
    },

    accountHolderName: {
      type: String,
      default: "",
    },

    accountNumber: {
      type: String,
      default: "",
    },

    ifscCode: {
      type: String,
      default: "",
    },



    // ================= INTEREST SETTINGS =================

    monthlyInterestRate: {
      type: Number,
      default: 2,
    },

    autoInterestEnabled: {
      type: Boolean,
      default: true,
    },



    // ================= REMINDER SETTINGS =================

    reminderDaysBeforeDue: {
      type: Number,
      default: 1,
    },

    overdueReminderEnabled: {
      type: Boolean,
      default: true,
    },

    lowStockAlertEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model(
  "Settings",
  settingsSchema
);

export default Settings;