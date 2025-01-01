import { Router } from "express";
import * as BookingModel from "../Controllers/Bookings/bookingsModel"


const router = Router();

// <--- Event Bookings --->
router.post("/booking/create", BookingModel.createBooking); 
router.post("/booking/confirm", BookingModel.confirmBooking); 

router.get('/booking/pending', BookingModel.getUserPendingBookings);
router.get('/booking/booked',BookingModel.getUserBookedEvents);
router.get('/booking/canceled' , BookingModel.getUserCancelledBookings);


export default router;