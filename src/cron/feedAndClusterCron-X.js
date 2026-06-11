import nodeCron from "node-cron";
import { runFeedAndCluster } from "../controllers/feedAndClusterController.js";

// Call feed and cluster every hour (at minute 0)
const cronJob = () =>
  nodeCron.schedule("0/2 * * * * *", () => {
    void runFeedAndCluster().catch((e) => console.error("cronJob error:", e));
  });

export { cronJob };
