import express from "express";
import { parseFeed } from "../utils/getFeedArray.js";
import { getFeedInArray } from "../controllers/getFeedInArrayController.js";
import { feedandCluster } from "../controllers/feedAndClusterController.js";
// import auth from "../middleware/auth.js";
import { allClustered } from "../controllers/allClusteredController.js";

const router = express.Router();

router.get("/feedInArray", getFeedInArray);

router.get("/feedAndCluster", feedandCluster); //requires auth

router.get("/allClustered", allClustered);

export default router;
