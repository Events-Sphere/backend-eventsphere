import { Response } from "express";
import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import { EventInterface } from "../../Interfaces/eventInterface";
import { EventClass } from "./eventClass";

const isValidEventData = (data: any): data is EventInterface => {
  return (
    typeof data._id === "number" &&
    typeof data.name === "string" &&
    typeof data.location === "string" &&
    typeof data.org_id === "number" &&
    typeof data.description === "string" &&
    data.registration_start instanceof Date &&
    data.registration_end instanceof Date &&
    typeof data.longitude === "number" &&
    typeof data.latitude === "number" &&
    typeof data.category === "string" &&
    Array.isArray(data.sub_event_items) &&
    data.sub_event_items.every((item: number) => typeof item === "number") &&
    Array.isArray(data.tags) &&
    data.tags.every((tag: string) => typeof tag === "string") &&
    typeof data.audience_type === "string" &&
    typeof data.currency === "string" &&
    typeof data.main_image === "string" &&
    Array.isArray(data.cover_images) &&
    data.cover_images.every((image: string) => typeof image === "string") &&
    typeof data.is_main === "number" &&
    typeof data.status === "number"
  );
};

const eventInstance = new EventClass();

export const createEvent = async (req: any, res: Response, next: any) => {
  try {
    const files: any = req.files;
    if (!files || Object.keys(files).length === 0) {
      return ApiResponseHandler.error(res, "Images are required", 400);
    }

    const groupedSubEventImages = files.reduce(
      (groupedFiles: Record<string, string[]>, file: any) => {
        const subEventName = file.fieldname;
        if (!groupedFiles[subEventName]) {
          groupedFiles[subEventName] = [];
        }
        groupedFiles[subEventName].push(file.filename);
        return groupedFiles;
      },
      {}
    );

    const filePathsArray: string[][] = Object.values(groupedSubEventImages);

    
    const data: EventInterface = JSON.parse(req.body.data);
    const org_id = req.id;

    const requiredFields = [
      "name",
      "location",
      "description",
      "registration_start",
      "registration_end",
      "latitude",
      "longitude",
      "category",
      "tags",
      "audience_type",
      "currency",
    ];

    const missingFields = requiredFields.filter(
      (field) => !(field in data) || data[field as keyof EventInterface] == null
    );

    if (missingFields.length > 0) {
      return ApiResponseHandler.error(
        res,
        `Missing required fields`,
        400
      );
    }

    if (!isValidEventData(data)) {
      return ApiResponseHandler.error(res, "Invalid event data provided.", 401);
    }

    const sub_events: any[] = data.sub_events;
    if (sub_events.length === 0) {
      return ApiResponseHandler.error(res, "Sub-events are required", 400);
    }

    
    const event = {
      _id: data._id,
      name: data.name,
      location: data.location,
      org_id: org_id,
      description: data.description,
      registration_start: data.registration_start,
      registration_end: data.registration_end,
      latitude: data.latitude,
      longitude: data.longitude,
      category: data.category,
      sub_event_items: JSON.stringify(data.sub_event_items),
      tags: JSON.stringify(data.tags),
      audience_type: data.audience_type,
      currency: data.currency,
      main_image: JSON.stringify(filePathsArray[0]),
      cover_images: JSON.stringify(filePathsArray[1]),
      sub_events:data.sub_events,
      is_main: data.is_main,
      status: data.status,
    };

    const response : any = await eventInstance.createEvent(event, filePathsArray);
    
    if(!response.status){
      return ApiResponseHandler.error(res, 'something went wrong. try again!', 500);
    }
    return ApiResponseHandler.success(res , response.response ,'Event created successfully.');
  } catch (err) {
    console.error("Error creating event:", err);
    return ApiResponseHandler.error(res , 'Internal server error', 501);
  }
};
