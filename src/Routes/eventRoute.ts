import { Router } from "express";
import * as EventModel from "../Controllers/Event/eventModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";

const router = Router();
const fileUploadInstance = new FileUploadMiddleware();

//<---- Event router----->
router.post("/create", fileUploadInstance.middleware(), EventModel.createEvent);
router.post("/update", fileUploadInstance.middleware(), EventModel.updateEvent);

//<---- Retrieve events------>
router.get("/all-events",EventModel.getAllEventsbyId);
router.get("/pending", EventModel.getPendingEventsById);
router.get("/completed", EventModel.getCompletedEventsById);
router.get("/active", EventModel.getActiveEventsById);
router.get("/rejected",EventModel.getAllRejectedEventsById);

router.get("/admin/all-events", EventModel.getAllEventsList);
router.get("/admin/pending", EventModel.getPendingEvents);
router.get("/admin/completed", EventModel.getCompletedEvents);
router.get("/admin/active", EventModel.getActiveEvents);
router.get("/admin/rejected", EventModel.getAllRejectedEventsById);

router.post("/search", EventModel.searchEvents);
router.post("/search-by-status", EventModel.searchEventsByStatus);

router.get("/by-category-name", EventModel.getEventsByCategoryName);
router.get("/popular", EventModel.getPopularEvents);
router.get("/upcoming", EventModel.getUpcomingEvents);



//<---- Events decisions [aprovel/rejection] routes ------>
router.post("/status-update" , EventModel.updateEventStatus);


export default router;
