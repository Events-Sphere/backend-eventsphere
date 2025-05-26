import { Router } from "express";
import * as AuthModel from "../Controllers/Auth/authModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
const fileUploadInstance = new FileUploadMiddleware();

const router = Router();

router.post("/login", AuthModel.login);
router.post("/signup", AuthModel.signup);
router.post("/validate-session", AuthModel.validateSession);
router.post(
  "/organizer/signup",
  fileUploadInstance.middleware(),
  AuthModel.organizerSignup
);


export default router;
// get organizer details

//router.get("/organizer",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound, AuthModel.);
// get organizer details
//router.get("/organizer",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound, AuthModel.);