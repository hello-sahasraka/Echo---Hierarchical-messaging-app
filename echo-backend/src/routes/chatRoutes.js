import express from "express";
import { create_chat, get_chat_list } from "../controllers/chat.controls.js";

const chatRouter = express.Router();

chatRouter.post("/createchat/:userId", create_chat);
chatRouter.post("/getchats", get_chat_list);

export default chatRouter;