import express from "express";

import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller.js";

const router = express.Router();



// get settings

router.get("/", getSettings);



// update settings

router.put("/", updateSettings);

export default router;