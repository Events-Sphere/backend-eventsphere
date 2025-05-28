import { Router } from "express";
import * as AuthModel from "../Controllers/Auth/authModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import UserModel from "../models/userModel";
import EventModel from "../models/eventModel";
import ApprovalModel from "../models/approvalModel";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";
import EventCategoryModel from "../models/eventCategoryModel";
const router = Router();

const user = new UserModel();
const event = new EventModel();
const approval = new ApprovalModel();
const authenticate = new AuthenticateUser();
const fileUploadInstance = new FileUploadMiddleware();
const category = new EventCategoryModel();

router.post("/login", AuthModel.adminLogin)
// router.post("/create", authenticate.verifyToken, authenticate.isAdmin, user.createAdmin);
router.post("/create", user.createAdmin);

router.post("/squard/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), user.createSquad)

router.post("/users", authenticate.verifyToken, authenticate.isAdmin, user.getAllUsers)
router.post("/users/single", authenticate.verifyToken, authenticate.isAdmin, user.getUserById)
router.post("/organizers", authenticate.verifyToken, authenticate.isAdmin, user.getAllOrganizers)
router.post("/organizer/single", authenticate.verifyToken, authenticate.isAdmin, user.getOrganizerById)
router.post("/squads", authenticate.verifyToken, authenticate.isAdmin, user.getAllSquads)

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

router.post("/user/approve", authenticate.verifyToken, authenticate.isAdmin, approval.approveUser)
router.post("/user/reject", authenticate.verifyToken, authenticate.isAdmin, approval.rejectUser)

router.post("/organizer/approve", authenticate.verifyToken, authenticate.isAdmin, approval.approveOrganizer)
router.post("/organizer/reject", authenticate.verifyToken, authenticate.isAdmin, approval.rejectOrganizer)

router.post("/event/approve-reject", authenticate.verifyToken, authenticate.isAdmin, approval.approveOrRejectEvent)

router.post("/events/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), event.createEvent);


router.post("/category/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), category.createCategory);
router.get("/categories",authenticate.verifyToken,authenticate.isAdmin,category.getAllCategories);
router.post(
  "/category/delete",
  authenticate.verifyToken,
  authenticate.isAdmin,
  category.deleteCategory
);




// router.post(
//   "/categories/update",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   fileUploadInstance.middleware(),
//   CategoryModel.updateCategoryByID
// );
// router.post(
//   "/categories/delete",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   CategoryModel.deleteCategoryByID
// );
// router.get(
//   "/categories/single",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   CategoryModel.getCategoryById
// );
// router.get(
//   "/categories",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   CategoryModel.getAllCategories
// );

export default router;



