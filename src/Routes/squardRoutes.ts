import { Router } from "express";
import UserModel from "../models/userModel";
import ApprovalModel from "../models/approvalModel";
import EventModel from "../models/eventModel";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";
const router = Router();

const user = new UserModel();
const approval = new ApprovalModel();
const event = new EventModel();
const authenticate = new AuthenticateUser();

router.get("/profile", authenticate.verifyToken, authenticate.isSquad, user.getUserProfileByRoleAndId)

router.get("/users/active", authenticate.verifyToken, authenticate.isSquad, user.getAllActiveUsers)
router.get("/users/pending", authenticate.verifyToken, authenticate.isSquad, user.getAllPendingUsers)
router.get("/users/rejected", authenticate.verifyToken, authenticate.isSquad, user.getAllRejectedUsers)

router.get("/organizers/active", authenticate.verifyToken, authenticate.isSquad, user.getAllActiveOrganizers)
router.get("/organizers/pending", authenticate.verifyToken, authenticate.isSquad, user.getAllPendingOrganizers)
router.get("/organizers/rejected", authenticate.verifyToken, authenticate.isSquad, user.getAllRejectedOrganizers)

router.get("/events/active", authenticate.verifyToken, authenticate.isSquad, event.getAllActiveEvents)
router.get("/events/pending", authenticate.verifyToken, authenticate.isSquad, event.getAllPendingEvents)
router.get("/events/rejected", authenticate.verifyToken, authenticate.isSquad, event.getAllRejectedEvents)
router.get("/events/completed", authenticate.verifyToken, authenticate.isSquad, event.getAllCompletedEvents)

router.post("/user/approve", authenticate.verifyToken, authenticate.isSquad, approval.approveUser)
router.post("/user/reject", authenticate.verifyToken, authenticate.isSquad, approval.rejectUser)

router.post("/organizer/approve", authenticate.verifyToken, authenticate.isSquad, approval.approveOrganizer)
router.post("/organizer/reject", authenticate.verifyToken, authenticate.isSquad, approval.rejectOrganizer)

router.post("/event/approve-reject", authenticate.verifyToken, authenticate.isSquad, approval.approveOrRejectEvent)

export default router;