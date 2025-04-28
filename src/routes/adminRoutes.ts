import { Router } from "express";
import * as AuthModel from "../Controllers/Auth/authModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import UserModel from "../models/userModel";
import EventModel from "../models/eventModel";
import ApprovalModel from "../models/approvalModel";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";

const router = Router();

const user = new UserModel();
const event = new EventModel();
const approval = new ApprovalModel();
const authenticate = new AuthenticateUser();
const fileUploadInstance = new FileUploadMiddleware();

router.post("/login", AuthModel.adminLogin)
// router.post("/create", authenticate.verifyToken, authenticate.isAdmin, user.createAdmin);
router.post("/create", user.createAdmin);

router.post("/squard/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), user.createSquad)

router.get("/users", authenticate.verifyToken, authenticate.isAdmin, user.getAllUsers)
router.get("/organizers", authenticate.verifyToken, authenticate.isAdmin, user.getAllOrganizers)
router.get("/squads", authenticate.verifyToken, authenticate.isAdmin, user.getAllSquads)

router.get("/users/active", authenticate.verifyToken, authenticate.isAdmin, user.getAllActiveUsers)
router.get("/users/pending", authenticate.verifyToken, authenticate.isAdmin, user.getAllPendingUsers)
router.get("/users/rejected", authenticate.verifyToken, authenticate.isAdmin, user.getAllRejectedUsers)

router.get("/organizers/active", authenticate.verifyToken, authenticate.isAdmin, user.getAllActiveOrganizers)
router.get("/organizers/pending", authenticate.verifyToken, authenticate.isAdmin, user.getAllPendingOrganizers)
router.get("/organizers/rejected", authenticate.verifyToken, authenticate.isAdmin, user.getAllRejectedOrganizers)

router.get("/events/active", authenticate.verifyToken, authenticate.isAdmin, event.getAllActiveEvents)
router.get("/events/pending", authenticate.verifyToken, authenticate.isAdmin, event.getAllPendingEvents)
router.get("/events/rejected", authenticate.verifyToken, authenticate.isAdmin, event.getAllRejectedEvents)
router.get("/events/completed", authenticate.verifyToken, authenticate.isAdmin, event.getAllCompletedEvents)

router.get("/user/approve", authenticate.verifyToken, authenticate.isAdmin, approval.approveUser)
router.get("/user/reject", authenticate.verifyToken, authenticate.isAdmin, approval.rejectUser)

router.get("/organizer/approve", authenticate.verifyToken, authenticate.isAdmin, approval.approveOrganizer)
router.get("/organizer/reject", authenticate.verifyToken, authenticate.isAdmin, approval.rejectOrganizer)

router.post("/event/approve-reject", authenticate.verifyToken, authenticate.isAdmin, approval.approveOrRejectEvent)


export default router;



