import express from "express";
import { create_chat } from "../controllers/chat.controls.js";

const chatRouter = express.Router();

chatRouter.post("/createchat", create_chat);

export default chatRouter;