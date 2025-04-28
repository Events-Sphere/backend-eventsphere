import { Router } from "express";
import * as EventModel from "../Controllers/Event/eventModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";
const router = Router();

const authenticate = new AuthenticateUser();
const fileUploadInstance = new FileUploadMiddleware();
// const imageParserInstance = new ImageParser();

//<---- Event router----->
router.post("/create", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, fileUploadInstance.middleware(), EventModel.createEvent);
router.post("/update", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, fileUploadInstance.middleware(), EventModel.updateEvent);

//<---- Retrieve events------>
router.get("/pending", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, EventModel.getPendingEventsById);
router.get("/completed", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, EventModel.getCompletedEventsById);
router.get("/active", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, EventModel.getActiveEventsById);

router.get("/admin/pending", authenticate.verifyToken, authenticate.isAdmin, EventModel.getPendingEvents);
router.get("/admin/completed", authenticate.verifyToken, authenticate.isAdmin, EventModel.getCompletedEvents);
router.get("/admin/active", authenticate.verifyToken, authenticate.isAdmin, EventModel.getActiveEvents);

router.post("/search", authenticate.verifyToken, EventModel.searchEvents);
router.get("/by-category-name", authenticate.verifyToken, EventModel.getEventsByCategoryName);
router.get("/popular", authenticate.verifyToken, EventModel.getPopularEvents);
router.get("/upcoming", authenticate.verifyToken, EventModel.getUpcomingEvents);

//<---- Events decisions [aprovel/rejection] routes ------>
// router.post("/status-update" , EventModel.updateEventStatus);


export default router;