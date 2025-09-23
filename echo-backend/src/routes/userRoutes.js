import express from "express";
import { create_user } from "../controllers/user.controls.js";



const userRouter = express.Router();


userRouter.post("/", create_user);

export default userRouter;