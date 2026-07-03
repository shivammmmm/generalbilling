import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    type: {
      type: String,
      enum: ["credit", "payment", "interest"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank"],
    },

    dueDate: {
      type: Date,
    },



    // ================= PRODUCTS =================

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
        },

        price: {
          type: Number,
        },
      },
    ],



    // ================= INTEREST SYSTEM =================

    interestApplied: {
      type: Boolean,
      default: false,
    },

    interestMonth: {
      type: String,
    },



    // ================= TRANSACTION STATUS =================

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

export default Transaction;