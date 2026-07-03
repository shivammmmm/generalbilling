import express from "express";

import {
  salesReport,
  farmerDueReport,
  stockReport,
  villageReport,
  chartAnalytics,
  dashboardSummary,
} from "../controllers/report.controller.js";

const router = express.Router();



// sales report

router.get("/sales", salesReport);



// farmer due report

router.get("/farmer-due", farmerDueReport);



// stock report

router.get("/stock", stockReport);



// village report

router.get("/village", villageReport);



// chart analytics

router.get("/charts", chartAnalytics);



// dashboard summary

router.get("/dashboard", dashboardSummary);

export default router;