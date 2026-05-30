import express from "express";
import { parseFeed } from "../utils/getFeedArray.js";
import { getFeedInArray } from "../controllers/getFeedInArrayController.js";

const router = express.Router();

router.get("/feedInArray", getFeedInArray);

export default router;
