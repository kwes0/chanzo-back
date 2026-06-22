import express from "express";
import { parseFeed } from "../utils/getFeedArray.js";
import { getFeedInArray } from "../controllers/getFeedInArrayController.js";
import { feedandCluster } from "../controllers/feedAndClusterController.js";
// import auth from "../middleware/auth.js";
import {
  allClustered,
  getWeeksClusters,
} from "../controllers/allClusteredController.js";
import { cronAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/feedInArray", getFeedInArray);

router.get("/feedAndCluster", feedandCluster); //requires admin auth

router.get("/cronFeedAndCluster", cronAuth, feedandCluster); //Authenticated

router.get("/allClustered", allClustered);

// router.get("/dailyArticles", getDailyArticles);

router.get("/weeksClusters", getWeeksClusters);

export default router;
