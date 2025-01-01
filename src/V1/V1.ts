import { Router } from "express";
import eventRouter from '../Routes/eventRoute';
import authRouter from "../Routes/authRoute"
const router = Router();


// router.post("/internal-team");
// router.post("/organizer");


router.use("/event" , eventRouter);
router.use("/auth" , authRouter);



export default router;