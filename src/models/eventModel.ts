import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../Middleware/errorMiddleware";
import EventClass from "../classes/eventClass";
import CustomError from "../Utililes/customError";
import moment from "moment";
import { LRUCache } from "../Cache/LRUCache";
import { MainEventInterface, SubEventInterface } from "../Interfaces/eventInterface";
import { FirebaseStorage } from "../Services/Storage";

const event = new EventClass();
const cache = new LRUCache(3);

interface FileStorageResponse {
  status: boolean;
  message?: string;
  url?: any;
  urls?: any;
}

interface ParsedFiles {
  main_image: any | null;
  cover_images: any[];
  sub_cover_images: {
    [key: string]: any[];
  };
}


class EventModel {

  private isValidEventData = (data: any): data is MainEventInterface => {
    const requiredFields = [
      "name",
      "location",
      "description",
      "longitude",
      "latitude",
      "category",
      "audience_type",
      "currency",
      "is_main",
      "starting_date",
      "ending_date"
    ];
    for (const field of requiredFields) {
      if (
        data[field] === null ||
        data[field] === undefined ||
        data[field] === ""
      ) {
        return false;
      }
    }
    return true;
  };

  private isValidSubEventData = (subEvent: any): subEvent is SubEventInterface => {
    const requiredFields = [
      "c_code",
      "description",
      "end_time",
      "host_email",
      "host_mobile",
      "hostedBy",
      "name",
      "start_time",
      "starting_date",
      "ticket_price",
      "ticket_quantity",
      "ticket_type",
    ];
    for (const field of requiredFields) {
      if (
        subEvent[field] === null ||
        subEvent[field] === undefined ||
        subEvent[field] === ""
      ) {
        return false;
      }
    }
    return true;
  };

  getAllPendingEvents = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const events = await event.getEventsByStatus("pending")
    return res.status(200).json({
      success: true,
      data: events,
      message: "Pending events retrieved successfully"
    });
  })
  getAllActiveEvents = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const events = await event.getEventsByStatus("active")
    return res.status(200).json({
      success: true,
      data: events,
      message: "Active events retrieved successfully"
    });
  })
  getAllCompletedEvents = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const events = await event.getEventsByStatus("completed")
    return res.status(200).json({
      success: true,
      data: events,
      message: "Completed events retrieved successfully"
    });
  })
  getAllRejectedEvents = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const events = await event.getEventsByStatus("rejected")
    return res.status(200).json({
      success: true,
      data: events,
      message: "Rejected events retrieved successfully"
    });
  });

  getAllPendingEventsByOrganizerId = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    if (!id) return next(new CustomError("Id missing", 400))
    const events = await event.getEventsByStatusAndOrganizerId("pending", id)
    return res.status(200).json({
      success: true,
      data: events,
      message: "Pending events retrieved successfully"
    });
  })
  getAllActiveEventsByOrganizerId = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    if (!id) return next(new CustomError("Id missing", 400))
    const events = await event.getEventsByStatusAndOrganizerId("active", id)
    return res.status(200).json({
      success: true,
      data: events,
      message: "Active events retrieved successfully"
    });
  })
  getAllCompletedEventsByOrganizerId = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    if (!id) return next(new CustomError("Id missing", 400))
    const events = await event.getEventsByStatusAndOrganizerId("completed", id)
    return res.status(200).json({
      success: true,
      data: events,
      message: "Completed events retrieved successfully"
    });
  })
  getAllRejectedEventsByOrganizerId = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    if (!id) return next(new CustomError("Id missing", 400))
    const events = await event.getEventsByStatusAndOrganizerId("rejected", id)
    return res.status(200).json({
      success: true,
      data: events,
      message: "Rejected events retrieved successfully"
    });
  })
  createEvent = catchAsyncError(
    async (req: Request, res: Response, next: any) => {

      if (!req.body.data || !req.files) {
        return next(new CustomError("Missing required data in the request. Please provide the necessary event information", 400))
      }
      const user = req.user;
      if (!user) {
        return next(new CustomError("Something went wrong", 500))
      }
      const imageList: ParsedFiles = {
        main_image: null,
        cover_images: [],
        sub_cover_images: {},
      };

      if (Array.isArray(req.files)) {
        (req.files as Express.Multer.File[]).forEach((file) => {
          if (file.fieldname === "main_image") {
            imageList.main_image = file;
          } else if (file.fieldname === "cover_images") {
            imageList.cover_images.push(file);
          } else if (file.fieldname.startsWith("sub_cover_images")) {
            if (!imageList.sub_cover_images[file.fieldname]) {
              imageList.sub_cover_images[file.fieldname] = [];
            }
            imageList.sub_cover_images[file.fieldname].push(file);
          }
        });
      } else {
        return next(new CustomError("Image files not found", 400))
      }
      const data: MainEventInterface = JSON.parse(req.body.data);

      if (!this.isValidEventData(data)) {
        return next(new CustomError("Invalid event data provided", 401))
      }
      if (
        data.sub_events === null ||
        data.sub_events === undefined ||
        data.sub_events.length === 0
      ) {
        return next(new CustomError("Sub events are required", 400))
      }
      if (!Array.isArray(data.sub_events)) {
        return next(new CustomError("Sub-events must be an array", 400))
      }
      const mainImgFile = imageList.main_image;
      if (mainImgFile === null || mainImgFile === undefined) {
        return next(new CustomError("Main event image is required", 400))
      }
      const coverImgFiles = imageList.cover_images;
      if (
        coverImgFiles === null ||
        coverImgFiles === undefined ||
        Object.keys(coverImgFiles).length === 0
      ) {
        return next(new CustomError("Cover Images are required", 400))
      };
      const imageKeys = Object.keys(imageList.sub_cover_images ?? []);
      if (imageKeys.length !== data.sub_events.length) {
        return next(new CustomError("Sub events cover Images are required", 400))
      };
      const imgUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadSingleImage(
          `EVENTS/MAIN EVENT IMAGES`,
          mainImgFile
        );
      if (imgUploadedResponse.status === false) {
        return next(new CustomError(imgUploadedResponse.message ??
          "failed to upload main event images. try again!", 500))
      }
      const coverImgUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadCoverImages(
          `EVENTS/COVER IMAGES`,
          coverImgFiles
        );
      if (coverImgUploadedResponse.status === false) {
        return next(new CustomError("failed to upload cover images. try again later", 500))
      }
      const subEventIds: any[] = [];
      const subEventsData: SubEventInterface[] = [];
      let idx = 0;
      for (let subEvent of data.sub_events) {
        if (!this.isValidSubEventData(subEvent)) {
          return next(new CustomError(`Invalid sub-event data: ${subEvent}`, 400))
        }
        subEventIds.push(subEvent._id);
        const subCoverGroupKey = `sub_cover_images${idx + 1}`;
        idx += 1;
        const subEventCoverImgFile = imageList.sub_cover_images[subCoverGroupKey];
        const coverImgUploadedResponse: FileStorageResponse =
          await FirebaseStorage.uploadSubEventCoverImages(
            `EVENTS/SUB EVENTS IMAGES/subevent_cover_img${idx}_${Date.now()}.jpg`,
            subEventCoverImgFile
          );
        if (coverImgUploadedResponse.status === false) {
          return next(new CustomError("failed to upload sub event cover images. try again later", 500))
        }
        const subevent: SubEventInterface = {
          name: subEvent.name,
          description: subEvent.description,
          cover_images: JSON.stringify(coverImgUploadedResponse.urls),
          video_url: subEvent.video_url || null,
          start_time: subEvent.start_time,
          end_time: subEvent.end_time,
          starting_date: moment(subEvent.starting_date).format("YYYY-MM-DD"),
          hostedBy: subEvent.hostedBy,
          host_email: subEvent.host_email,
          host_mobile: subEvent.host_mobile,
          c_code: subEvent.c_code,
          ticket_quantity: subEvent.ticket_quantity,
          ticket_sold: 0,
          ticket_type: subEvent.ticket_type,
          ticket_price: subEvent.ticket_price,
          earnings: 0,
          restrictions: "[]" //JSON.stringify(subEvent.restrictions),
        };
        subEventsData.push(subevent);
      }
      const mainEvents = {
        name: data.name,
        location: data.location,
        org_id: user.id,
        description: data.description,
        registration_start: moment(data.registration_start).format(
          "YYYY-MM-DD"
        ),
        registration_end: moment(data.registration_end).format(
          "YYYY-MM-DD"
        ),
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        sub_event_items: JSON.stringify(subEventIds),
        tags: JSON.stringify(data.tags),
        audience_type: data.audience_type,
        currency: data.currency,
        main_image: imgUploadedResponse.url,
        cover_images: JSON.stringify(coverImgUploadedResponse.urls),
        is_main: data.is_main,
        starting_date: moment(data.starting_date).format(
          "YYYY-MM-DD"
        )
        ,
        ending_date: moment(data.ending_date).format(
          "YYYY-MM-DD"
        )
      };
      const response: any = await event.createEvent(
        mainEvents,
        subEventsData
      );
      console.log("main ebvent ID :" + response.eventId)
      if(req.user?.role === "organizer") {
      const updateOrganizerEventCount =
        await event.updateOrganizationPendingEvent(
          mainEvents.org_id,
          response.eventId
        );
      }
      // if (!updateOrganizerEventCount.status) {
      //   console.log(
      //     "call the fn again to update count of the envent and organization pending events as well"
      //   );
      // }
      return res.status(200).json({
        success: true,
        data: null,
        message: "Event created successfully"
      })
    }
  );

  searchEvents = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { query = "", eventType = "active_events" } = req.body;
    if (!req.user?.id) return res.status(400).send({
      success: false,
      message: "Organizer ID missing"
    });
    if (typeof query !== "string" || query.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Query is required and must be a string"
      });
    }
    const allowedTypes = ["active_events", "pending_events", "completed_events"];
    if (!allowedTypes.includes(eventType)) {
      return res.status(400).json({ success: false, message: "Invalid event type" });
    }
    const events = await event.searchEvents(req.user?.id, query.trim(), eventType);
    return res.status(200).json({
      success: true,
      data: events,
      message: "Events retrieved successfully"
    });
  });

  getDashboardOverview = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    req.user = {id : 21, role:"organizer"};
    if (!req.user?.id || typeof req.user?.id !== 'number') {
      throw new Error("Invalid organization ID");
    }
    const dashboardStat = await event.getOrganizationDashboardStats(req.user?.id);
    return res.status(200).send({
      success: true,
      data: dashboardStat,
      message: "Dashboard overview data retrieved successfully."
    })
  });


}

export default EventModel;