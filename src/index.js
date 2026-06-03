import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import { parseFeed } from "./utils/getFeedArray.js";

// IMPORTING ROUTES
import feedsArrayRoutes  from "./routes/feedsArrayRoutes.js";

//Call thirdparty to start before framework is initialized
config();
connectDB();
// parseFeed(); Hapa ilikuwa testing one two

const app = express();

//Body parsing middleware
app.use(express.json()); //This ensures that JSON data is handled. Node and express don't handle JSON by default and require a parser.
app.use(express.urlencoded({ extended: true }));

// USE OF IMPORTED ROUTES
app.use("/array", feedsArrayRoutes);



//Server and fail safes
//Port config and listening to the server
const PORT = 3003;
const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
}); //We need to create an instance of the server so that we can handle the instance errors.

//Handle unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

//Handle uncaught exception
process.on("uncaughtException", async (err) => {
  console.error(`Unhandled exception: ${err.message}`);
  await disconnectDB();
  process.exit(1);
});

//Gracefully shutdowmn the server on SIGTERM signal
process.on("SIGTERM", async () => {
  console.log("SIGTERM received - Shutting down server.");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
