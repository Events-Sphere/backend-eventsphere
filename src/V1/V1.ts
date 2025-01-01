import { Router } from "express";
import authRouter from "../Routes/authRoute"
import eventRouter from "../Routes/eventRoute";
import categoryRouter from "../Routes/catogoriesRoute";
import userRouter from "../Routes/userRouter";

const router = Router();


// router.post("/internal-team");
// router.post("/organizer");


router.use("/auth" , authRouter);
router.use("/event" , eventRouter);
router.use("/category" , categoryRouter);
router.use("/user" , userRouter);



export default router;