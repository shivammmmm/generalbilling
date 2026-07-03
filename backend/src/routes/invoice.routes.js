import express from "express";

import {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  printInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";

const router = express.Router();



// create invoice

router.post("/", createInvoice);



// all invoices

router.get("/", getAllInvoices);



// single invoice

router.get("/:id", getSingleInvoice);



// print invoice

router.get("/print/:id", printInvoice);



// delete invoice

router.delete("/:id", deleteInvoice);

export default router;
