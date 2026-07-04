import Invoice from "../models/Invoice.js";
import Farmer from "../models/Farmer.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

import generateDocumentNumber from "../utils/generateInvoiceNumber.js";

// ================= CREATE INVOICE =================

export const createInvoice = async (req, res) => {
  try {
    const {
      farmerId,
      billingType = "credit",
      rateType,
      documentType = "gst_invoice",
      products = [],
    } = req.body;

    // documentType determines GST on/off
    const gstEnabled = documentType === "gst_invoice";

    // farmer check

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    if (!products.length) {
      return res.status(400).json({
        message: "At least one invoice item is required",
      });
    }

    const activeRateType = rateType || farmer.defaultRateType || "Rate A";

    let subTotal = 0;
    let totalGST = 0;

    const invoiceProducts = [];

    // process products

    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // auto rate selection

      let selectedRate = 0;

      if (activeRateType === "Rate A") {
        selectedRate = product.cashRate;
      } else if (activeRateType === "Rate B") {
        selectedRate = product.creditRate;
      } else if (activeRateType === "Rate C") {
        selectedRate = product.wholesaleRate;
      } else {
        selectedRate = product.cashRate;
      }

      if (item.selectedRate !== undefined && item.selectedRate !== "") {
        selectedRate = Number(item.selectedRate);
      }

      // calculations

      const quantity = Number(item.quantity) || 1;
      const length = Number(item.length) || 0;
      const width = Number(item.width) || 0;
      const sqFt = length * width;

      // GST only applies for GST invoices
      const gstRate =
        gstEnabled
          ? (item.gstRate !== undefined && item.gstRate !== ""
              ? Number(item.gstRate)
              : product.gstRate || 0)
          : 0;

      const itemTotal = sqFt * selectedRate * quantity;

      const gstAmount = (itemTotal * gstRate) / 100;

      const finalAmount = itemTotal + gstAmount;

      subTotal += itemTotal;

      totalGST += gstAmount;

      invoiceProducts.push({
        product: product._id,

        // snapshot HSN code at time of invoice creation
        hsnCode: product.hsnCode || "",

        quantity,

        length,

        width,

        sqFt,

        selectedRate,

        gstRate,

        baseAmount: itemTotal,

        gstAmount,

        totalAmount: finalAmount,
      });
    }

    // grand total

    const grandTotal = subTotal + totalGST;

    // document number (async, DB-backed sequential)

    const invoiceNumber = await generateDocumentNumber(documentType);

    // payment status

    let paymentStatus = "paid";

    if (billingType === "credit") {
      paymentStatus = "pending";
    }

    // create invoice

    const invoice = await Invoice.create({
      invoiceNumber,

      documentType,

      farmer: farmerId,

      billingType,

      rateType: activeRateType,

      products: invoiceProducts,

      gstEnabled,

      subTotal,

      totalGST,

      grandTotal,

      paymentStatus,
    });

    // CREDIT BILLING → create transaction

    if (billingType === "credit") {
      // update farmer due

      farmer.dueAmount += grandTotal;

      await farmer.save();

      // create transaction

      await Transaction.create({
        farmer: farmer._id,

        type: "credit",

        amount: grandTotal,

        description: `Invoice ${invoiceNumber}`,

        dueDate: req.body.dueDate,
      });
    }

    res.status(201).json({
      success: true,
      message: "Invoice Created Successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET ALL INVOICES =================

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("farmer")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalInvoices: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= SINGLE INVOICE =================

export const getSingleInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("farmer")
      .populate("products.product");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= PRINT INVOICE =================

export const printInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("farmer")
      .populate("products.product");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // also send settings for shop name/GST number on printout
    const Settings = (await import("../models/Settings.js")).default;
    const settings = await Settings.findOne() || {};

    res.status(200).json({
      success: true,
      printableInvoice: invoice,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE INVOICE =================

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (invoice.billingType === "credit") {
      const farmer = await Farmer.findById(invoice.farmer);

      if (farmer) {
        farmer.dueAmount = Math.max(
          0,
          farmer.dueAmount - Number(invoice.grandTotal || 0)
        );
        await farmer.save();
      }

      await Transaction.deleteOne({
        farmer: invoice.farmer,
        type: "credit",
        description: `Invoice ${invoice.invoiceNumber}`,
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Invoice deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
