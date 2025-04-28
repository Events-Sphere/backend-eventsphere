import { Router } from "express";
import authRouter from "../routes/authRoute"
import eventRouter from "../routes/eventRoute";
import categoryRouter from "../routes/catogoriesRoute";
import userRouter from "../routes/userRouter";
import adminRouter from "../routes/adminRoutes";
import squardRouter from "../routes/squardRoutes"
import organizerRouter from "../routes/organizerRoutes"
const router = Router();


router.use("/user", userRouter);   
router.use("/admin", adminRouter);  
router.use("/squad",squardRouter) 
router.use("/organizer", organizerRouter);


router.use("/auth", authRouter);           
router.use("/events", eventRouter);       
router.use("/categories", categoryRouter); 
      



export default router;