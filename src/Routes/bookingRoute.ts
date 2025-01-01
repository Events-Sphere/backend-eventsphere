import { Router } from "express";


const router = Router();

// <--- Event Bookings --->
router.post("/booking/create"); 
router.post("/booking/confirm"); 

export default router;