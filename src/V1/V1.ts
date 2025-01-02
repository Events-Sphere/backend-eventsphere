import { Router } from "express";
import authRouter from "../Routes/authRoute"
import eventRouter from "../Routes/eventRoute";
import categoryRouter from "../Routes/catogoriesRoute";
import userRouter from "../Routes/userRouter";

const router = Router();

router.use("/auth", authRouter);           
router.use("/events", eventRouter);       
router.use("/categories", categoryRouter); 
router.use("/users", userRouter);         



export default router;