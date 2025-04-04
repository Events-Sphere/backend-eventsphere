import { Router } from "express";
import * as EventModel from "../Controllers/Event/eventModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";
const router = Router();
const fileUploadInstance =new FileUploadMiddleware();
// const imageParserInstance = new ImageParser();

//<---- Event router----->
router.post("/create",AuthenticateUser.verifyToken,AuthenticateUser.isOrganizerHaveAccess, fileUploadInstance.middleware(), EventModel.createEvent);
router.post("/update",AuthenticateUser.verifyToken,AuthenticateUser.isOrganizerHaveAccess, fileUploadInstance.middleware(), EventModel.updateEvent);

//<---- Retrieve events------>
router.get("/pending",AuthenticateUser.verifyToken,AuthenticateUser.isOrganizerHaveAccess, EventModel.getPendingEventsById);
router.get("/completed",AuthenticateUser.verifyToken,AuthenticateUser.isOrganizerHaveAccess, EventModel.getCompletedEventsById);
router.get("/active",AuthenticateUser.verifyToken,AuthenticateUser.isOrganizerHaveAccess, EventModel.getActiveEventsById);

router.get("/admin/pending",AuthenticateUser.verifyToken,AuthenticateUser.isAdmin, EventModel.getPendingEvents);
router.get("/admin/completed",AuthenticateUser.verifyToken,AuthenticateUser.isAdmin, EventModel.getCompletedEvents);
router.get("/admin/active",AuthenticateUser.verifyToken,AuthenticateUser.isAdmin, EventModel.getActiveEvents);

router.post("/search",AuthenticateUser.verifyToken, EventModel.searchEvents);
router.get("/by-category-name",AuthenticateUser.verifyToken, EventModel.getEventsByCategoryName);
router.get("/popular",AuthenticateUser.verifyToken, EventModel.getPopularEvents);
router.get("/upcoming",AuthenticateUser.verifyToken, EventModel.getUpcomingEvents);

//<---- Events decisions [aprovel/rejection] routes ------>
router.post("/status-update" , EventModel.updateEventStatus);


export default router;