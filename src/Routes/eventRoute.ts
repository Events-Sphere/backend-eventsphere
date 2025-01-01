import { Router } from "express";
import * as EventModel from "../Controllers/Event/eventModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";

const router = Router();
const fileUploadInstance = new FileUploadMiddleware();

//<---- Event router----->
router.post("/create", fileUploadInstance.middleware(), EventModel.createEvent);
router.post("/update", fileUploadInstance.middleware(), EventModel.updateEvent);

router.get("/pendingevents",EventModel.getPendingEvents);
router.get("/completedevents", EventModel.getCompletedEvents);
router.get("/activeEvents", EventModel.getActiveEvents);

router.get("/getBycategoryName" , EventModel.getEventsByCategoryName);
router.get("/popular", EventModel.getPopularEvents);
router.get("/upcoming" , EventModel.getUpcomingEvents);

export default router;
