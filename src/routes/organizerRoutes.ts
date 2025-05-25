import { Router } from "express";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import  AuthenticateUser  from "../Middleware/authenticateUserMiddleware";
import EventModel from "../models/eventModel";
import UserModel from "../models/userModel";

const router = Router();

const event = new EventModel();
const user = new UserModel();
const authenticate = new AuthenticateUser();
const fileUploadInstance = new FileUploadMiddleware();

router.get("/profile", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, user.getUserProfileByRoleAndId)
router.get("/dashboard/overview", event.getDashboardOverview);
router.post("/event/create", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, fileUploadInstance.middleware(), event.createEvent);
router.get("/events/search", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, event.searchEvents);
router.get("/events/active", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, event.getAllActiveEventsByOrganizerId)
router.get("/events/pending", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, event.getAllPendingEventsByOrganizerId)
router.get("/events/rejected", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, event.getAllRejectedEventsByOrganizerId)
router.get("/events/completed", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, event.getAllCompletedEventsByOrganizerId)

export default router;



