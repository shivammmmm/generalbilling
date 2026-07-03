import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    billingType: {
      type: String,
      enum: ["credit", "cash", "wholesale"],
      default: "credit",
    },

    rateType: {
      type: String,
      enum: ["Rate A", "Rate B", "Rate C"],
      default: "Rate A",
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
          required: true,
        },

        length: {
          type: Number,
          default: 0,
        },

        width: {
          type: Number,
          default: 0,
        },

        sqFt: {
          type: Number,
          default: 0,
        },

        selectedRate: {
          type: Number,
          required: true,
        },

        gstRate: {
          type: Number,
          default: 0,
        },

        baseAmount: {
          type: Number,
          default: 0,
        },

        gstAmount: {
          type: Number,
          default: 0,
        },

        totalAmount: {
          type: Number,
          required: true,
        },
      },
    ],

    gstEnabled: {
      type: Boolean,
      default: true,
    },

    subTotal: {
      type: Number,
      required: true,
    },

    totalGST: {
      type: Number,
      required: true,
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model(
  "Invoice",
  invoiceSchema
);

export default Invoice;
