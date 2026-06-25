import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import { parseFeed } from "./utils/getFeedArray.js";
import cors from "cors";

// IMPORTING ROUTES
import feedsArrayRoutes from "./routes/feedsArrayRoutes.js";
import "./cron/fetchAndClusterCron.js";

//Call thirdparty to start before framework is initialized
config();
connectDB();
// parseFeed(); Hapa ilikuwa testing one two

const app = express();

const localhost = process.env.LOCALHOST_FRONT;
const remotehost = process.env.REMOTEHOST_FRONT;

//Body parsing middleware
app.use(express.json()); //This ensures that JSON data is handled. Node and express don't handle JSON by default and require a parser.
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: localhost || remotehost,
    methods: ["GET"],
  }),
);

// USE OF IMPORTED ROUTES
app.use("/ropie", feedsArrayRoutes);

// feedAndClusterCron();

//Server and fail safes
//Port config and listening to the server
const PORT = 3003;
const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
}); //We need to create an instance of the server so that we can handle the instance errors.

//Handle unhandled promise rejection
process.on("unhandledRejection", (err) => {
  //This happens when a promise is rejected(fails) and there is no error handler attached to it.
  console.error(`Unhandled rejection: ${err.message}`);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

//Handle uncaught exception
process.on("uncaughtException", async (err) => {
  //This is when a javascript error is thrown and there is no error handler attached to it.
  console.error(`Unhandled exception: ${err.message}`);
  await disconnectDB();
  process.exit(1);
});

//Gracefully shutdowmn the server on SIGTERM signal
process.on("SIGTERM", async () => {
  //Unix termination signal used for graceful shutdowns, not an error itself; however, it is often associated with exit codes like 143 in Docker or Kubernetes when applications fail to handle the signal properly.
  console.log("SIGTERM received - Shutting down server.");
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});
