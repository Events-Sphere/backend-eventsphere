import { Router } from "express";
import * as EventModel  from "../Controllers/Event/eventModel";
import { ImageParser } from "../Middleware/ImageParser";


const router = Router();
const imageParserInstance = new ImageParser();

router.post("/create" ,/*verify organizer or admin ,*/imageParserInstance.middleware(), EventModel.createEvent);
router.get("/get-all-events");
router.get("/get-pending-events");
router.get("/get-completed-events");
router.get("/get-active-events");



export default router;