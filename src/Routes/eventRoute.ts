import { Router } from "express";
import * as EventModel  from "../Controllers/Event/eventModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";


const router = Router();
const fileUploadInstance = new FileUploadMiddleware();

//<---- Event router----->
router.post("/create" ,/*verify organizer or admin ,*/fileUploadInstance.middleware(), EventModel.createEvent);
router.post("/update", /* verify admin, */ fileUploadInstance.middleware(),EventModel.updateEvent);
router.get("/get-pending-events");
router.get("/get-completed-events");
router.get("/get-active-events");

//<---- Event Category Router ----->
router.post(
    "/category/create",
    /* verify admin, */ fileUploadInstance.middleware(),
    EventModel.createCategory
  );
  
  router.post(
    "/category/update",
    /* verify admin, */ fileUploadInstance.middleware(),
    EventModel.updateCategoryByID
  );
  
  router.post(
    "/category/delete",
    /* verify admin, */ EventModel.deteleCategoryByID
  );
  
  router.post(
    "/category/get/single",
    /* verify admin, */ EventModel.getCategoryById 
  );
  
  router.post(
    "/category/get/all",
    /* verify admin, */ EventModel.getAllCategories
  );
  

export default router;