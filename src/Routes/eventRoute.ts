import { Router } from "express";
import * as EventModel  from "../Controllers/Event/eventModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";


const router = Router();
const fileUploadInstance = new FileUploadMiddleware();

//<---- Event router----->
router.post("/create" ,/*verify organizer or admin ,*/fileUploadInstance.middleware(), EventModel.createEvent);
router.get("/get-all-events");
router.get("/get-pending-events");
router.get("/get-completed-events");
router.get("/get-active-events");

//<---- Event category router----->
router.post("/category/create" , /* verify admin ,*/ fileUploadInstance.middleware() ,EventModel.createCategory);



export default router;