import express from "express";
import { parseFeed } from "../utils/getFeedArray.js";
import { getFeedInArray } from "../controllers/getFeedInArrayController.js";
import { feedandCluster } from "../controllers/feedAndClusterController.js";

const router = express.Router();

router.get("/feedInArray", getFeedInArray);

router.get("/feedAndCluster", feedandCluster);

export default router;
