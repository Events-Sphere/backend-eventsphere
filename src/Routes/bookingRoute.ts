import { Router } from "express";
import * as BookingModel from "../Controllers/Bookings/bookingsModel"


const router = Router();


router.post("/bookings", BookingModel.createBooking); 
router.post("/bookings/confirm", BookingModel.confirmBooking); 

router.get("/bookings/pending", BookingModel.getUserPendingBookings); 
router.get("/bookings/confirmed", BookingModel.getUserBookedEvents); 
router.get("/bookings/canceled", BookingModel.getUserCancelledBookings); 


export default router;