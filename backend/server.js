import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

import app from "./src/app.js";

import connectDB from "./src/configs/db.js";

// cron jobs
import startCronJobs from "./src/utils/interestCron.js";



const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // database connection
  await connectDB();

  // start automatic cron jobs
  startCronJobs();

  // server
  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
  });
};

startServer();
