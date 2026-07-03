import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      default: "Sq Ft",
    },

    hsnCode: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    purchasePrice: {
      type: Number,
      default: 0,
    },

    creditRate: {
      type: Number,
      required: true,
    },

    cashRate: {
      type: Number,
      required: true,
    },

    wholesaleRate: {
      type: Number,
      required: true,
    },

    gstRate: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    status: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
