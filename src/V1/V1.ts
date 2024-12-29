import { Router } from "express";
import eventRouter from '../Routes/eventRoute';

const router = Router();


// router.post("/internal-team");
// router.post("/organizer");


router.use("/event" , eventRouter);



export default router;