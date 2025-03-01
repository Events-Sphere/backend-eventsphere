import { Router } from "express";
import authRouter from "../Routes/authRoute"
import eventRouter from "../Routes/eventRoute";
import categoryRouter from "../Routes/catogoriesRoute";
import userRouter from "../Routes/userRouter";
import adminRouter from "../Routes/adminRoutes";

const router = Router();


router.use("/user", userRouter);   
router.use("/admin", adminRouter);   








router.use("/auth", authRouter);           
router.use("/events", eventRouter);       
router.use("/categories", categoryRouter); 
      



export default router;