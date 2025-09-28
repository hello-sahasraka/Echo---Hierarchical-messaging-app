import express from "express";
import { create_user, user_login } from "../controllers/user.controls.js";



const userRouter = express.Router();


userRouter.post("/createuser", create_user);
userRouter.post("/login", user_login);

export default userRouter;