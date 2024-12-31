import { Response, Request } from "express";
import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import {
  EventInterface,
  MainEventInterface,
  SubEventInterface,
} from "../../Interfaces/eventInterface";
import { EventClass } from "./eventClass";
import { FirebaseStorage } from "../../Services/Storage";
import moment from 'moment';

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

const isValidEventData = (data: any): data is MainEventInterface => {
  const requiredFields = [
    "_id",
    "name",
    "location",
    "org_id",
    "description",
    "longitude",
    "latitude",
    "category",
    "audience_type",
    "currency",
    "is_main",
    "status",
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

const isValidSubEventData = (subEvent: any): subEvent is SubEventInterface => {
  const requiredFields = [
    "_id",
    "event_id",
    "name",
    "description",
    "start_time",
    "end_time",
    "starting_data",
    "hostedBy",
    "host_email",
    "host_mobile",
    "c_code",
    "ticket_quantity",
    "ticket_sold",
    "ticket_type",
    "ticket_price",
    "earnings",
    "approvedBy",
    "approvedAt",
    "restrictions",
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

const eventInstance = new EventClass();

export const createEvent = async (req: Request, res: Response, next: any) => {
  try {
    console.log(req.body.data)
    if (!req.body.data || !req.files) {
      return ApiResponseHandler.error(
        res,
        "Missing required data in the request. Please provide the necessary event information.",
        400
      );
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
      return ApiResponseHandler.error(res, "Image files not found", 400);
    }

    const data: EventInterface = JSON.parse(req.body.data);


    if (!isValidEventData(data)) {
      return ApiResponseHandler.error(res, "Invalid event data provided.", 401);
    }

    const mainImgFile = imageList.main_image;

    if (mainImgFile === null || mainImgFile === undefined) {
      return ApiResponseHandler.error(res, "Main event image is required", 400);
    }

    const imgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadMainImage(mainImgFile , data._id);
    if (imgUploadedResponse.status === false) {
      return ApiResponseHandler.error(
        res,
        imgUploadedResponse.message ??
          "failed to upload main event images. try again!",
        500
      );
    }

    const coverImgFiles = imageList.cover_images;
    if (
      coverImgFiles === null ||
      coverImgFiles === undefined ||
      Object.keys(coverImgFiles).length === 0
    ) {
      return ApiResponseHandler.error(res, "Cover Images are required", 400);
    }

    const coverImgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadCoverImages(coverImgFiles , data._id);
    if (coverImgUploadedResponse.status === false) {
      return ApiResponseHandler.error(
        res,
        "failed to upload cover images. try again later",
        500
      );
    }

    if (
      data.sub_events === null ||
      data.sub_events === undefined ||
      data.sub_events.length === 0
    ) {
      return ApiResponseHandler.error(res, "Sub events are required", 400);
    }

    if (!Array.isArray(data.sub_events)) {
      return ApiResponseHandler.error(res, "Sub-events must be an array.", 400);
    }

    const subEventIds: any[] = [];
    const subEventsData : SubEventInterface[] = [];

    let idx = 0;
    for(let subEvent of data.sub_events){
      if (!isValidSubEventData(subEvent)) {
        return ApiResponseHandler.error(
          res,
          `Invalid sub-event data: ${subEvent}`,
          400
        );
      }


      subEventIds.push(subEvent._id);
      const subCoverGroupKey = `sub_cover_images${idx + 1}`;
      idx+=1;

      const subEventCoverImgFile = imageList.sub_cover_images[subCoverGroupKey];

      const coverImgUploadedResponse: FileStorageResponse = await FirebaseStorage.uploadSubEventCoverImages(subEventCoverImgFile, data._id, subEvent._id);
      if (coverImgUploadedResponse.status === false) {
        return ApiResponseHandler.error(
          res,
          "failed to upload cover images. try again later",
          500
        );
      }

      const subevent: SubEventInterface = {
        _id: subEvent._id,
        event_id: subEvent.event_id,
        name: subEvent.name,
        description: subEvent.description,
        cover_images: JSON.stringify(coverImgUploadedResponse.urls),
        video_url: subEvent.video_url || null,
        start_time: moment(subEvent.start_time).format("HH:mm:ss"),
        end_time: moment(subEvent.end_time).format("HH:mm:ss"),
        starting_date: moment(subEvent.starting_date).format("YYYY-MM-DD"),
        hostedBy: subEvent.hostedBy,
        host_email: subEvent.host_email,
        host_mobile: subEvent.host_mobile,
        c_code: subEvent.c_code,
        ticket_quantity: subEvent.ticket_quantity,
        ticket_sold: subEvent.ticket_sold,
        ticket_type: subEvent.ticket_type,
        ticket_price: subEvent.ticket_price,
        earnings: subEvent.earnings,
        approvedBy: subEvent.approvedBy,
        approvedAt: moment(subEvent.approvedAt).format("YYYY-MM-DD HH:mm:ss"),
        denial_reason: subEvent.denial_reason || null,
        restrictions: JSON.stringify(subEvent.restrictions),
      };

      subEventsData.push(subevent);
    }


    subEventsData.map((d)=>{
      console.log(d);
    })

    const mainEvents = {
      _id: data._id,
      name: data.name,
      location: data.location,
      org_id: data.org_id,
      description: data.description,
      registration_start: moment(data.registration_start).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      registration_end: moment(data.registration_end).format(
        "YYYY-MM-DD HH:mm:ss"
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
      status: data.status,
    };

    const response: any = await eventInstance.createEvent(
      mainEvents,
      subEventsData
    );

    if (response.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    if (response.status === true) {
      return ApiResponseHandler.success(
        res,
        response.data,
        "Event created successfully."
      );
    }

    // const updateOrganizerEventCount = await eventInstance.updatePendingEvents(
    //   mainEvents.org_id,
    //   subEventIds
    // );
    // if (updateOrganizerEventCount.status === false) {
    //   console.log(
    //     "call the fn again to update count of the envent and organization pending events as well"
    //   );
    // }
  } catch (err) {
    console.error("Error creating event:", err);
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};
