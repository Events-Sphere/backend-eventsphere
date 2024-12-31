import { Router } from "express";
import * as AuthModel from '../Controllers/Auth/authModel';


const router = Router();

router.post("/login", AuthModel.login);
router.post("/signup", AuthModel.signup);


export default router;