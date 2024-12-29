import { Router } from "express";
import * as EventModel  from "../Controllers/Event/eventModel";


const router = Router();

router.post("/create" ,/*verify organizer or admin ,*/EventModel.createEvent);
router.get("/get-all-events");
router.get("/get-pending-events");
router.get("/get-completed-events");
router.get("/get-active-events");



export default router;