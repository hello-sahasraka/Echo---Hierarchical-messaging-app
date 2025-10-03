import express from "express";
import { create_user, get_all_users, get_subordinates, user_login } from "../controllers/user.controls.js";



const userRouter = express.Router();


userRouter.post("/createuser", create_user);
userRouter.post("/login", user_login);
userRouter.get("/subordinates/:user_id", get_subordinates);
userRouter.get("/getusers", get_all_users);

export default userRouter;