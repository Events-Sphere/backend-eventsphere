// <---------------------------------------USER APP ROUTES------------------------------------------------>
import express from "express";
import * as UserModel from "../Controllers/Users/UserModel";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import * as AuthModel from "../Controllers/Auth/authModel";
const fileUploadInstance = new FileUploadMiddleware();
import * as CategoryModel from "../Controllers/Category/categoryModel";
const router = express.Router();
import * as EventModel from "../Controllers/Event/eventModel";
import * as BookingModel from "../Controllers/Bookings/bookingsModel";


// ------------------------------------------HOME PAGE-----------------------------------------------------
router.get("/events/upcoming", AuthenticateUser.verifyToken, EventModel.getUpcomingEvents);
router.get("/detail", AuthenticateUser.verifyToken, AuthenticateUser.isUserFound, AuthModel.getUserNameAndLocation);
router.get(
  "/event/categories",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserFound,
  CategoryModel.getAllCategories
);

// ------------------------------------------BOOKING PAGE---------------------------------------------------
router.post(
  "/events/bookings",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.createBooking
);
router.get(
  "/events/bookings/active",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.getUserBookedEvents
);

// ------------------------------------------FAVOURITE PAGE-------------------------------------------------
router.post("/events/favourites/create", AuthenticateUser.verifyToken, AuthenticateUser.isUserHaveAccess, UserModel.addToFavorite);
router.post("/events/favourites/delete", AuthenticateUser.verifyToken, AuthenticateUser.isUserHaveAccess, UserModel.removeFromFavorite);
router.get("/events/favourites", AuthenticateUser.verifyToken, AuthenticateUser.isUserHaveAccess, UserModel.getFavoriteEvents);

// ------------------------------------------SEARCH PAGE-----------------------------------------------------
router.post("/events/search", AuthenticateUser.verifyToken, EventModel.searchEvents);

// ------------------------------------------PROFILE PAGE----------------------------------------------------
router.get("/profile", AuthenticateUser.verifyToken, 
  AuthenticateUser.isUserFound, AuthModel.getUserProfile);
router.post("/verify", AuthenticateUser.verifyToken, AuthenticateUser.isUserFound, 
  fileUploadInstance.middleware(), AuthModel.verifyUserIdentity);

// ------------------------------------------EVENT PAGE---------------------------------------------------
router.post("/events/by-category",AuthenticateUser.verifyToken, EventModel.getEventsByCategoryName);









// router.post(
//   "/events/bookings/confirm",
//   AuthenticateUser.verifyToken,
//   AuthenticateUser.isUserHaveAccess,
//   BookingModel.confirmBooking
// );

router.get(
  "/bookings/pending",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.getUserPendingBookings
);

router.get(
  "/bookings/canceled",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.getUserCancelledBookings
);











router.get("/name-location", AuthenticateUser.verifyToken, AuthenticateUser.isUserFound, AuthModel.getUserNameAndLocation);


router.get(
  "/event-categories",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserFound,
  CategoryModel.getAllCategories
);

router.post("/events/category", AuthenticateUser.verifyToken, EventModel.getEventsByCategoryName);

// router.get(
//   "/events/category",
//   AuthenticateUser.verifyToken,
//   AuthenticateUser.isUserFound,
//   CategoryModel.getCategoryById
// );
export default router;
