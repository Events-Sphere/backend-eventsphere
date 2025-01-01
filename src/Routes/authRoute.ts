import { Router } from "express";
import * as AuthModel from '../Controllers/Auth/authModel';
import { Authenticate } from "../Utililes/authenticate";


const router = Router();

router.post("/login", AuthModel.login);
router.post("/signup", AuthModel.signup);

router.post("/verify",Authenticate.isAuthenticated,Authenticate.isAthorized(["user"]));




export default router;