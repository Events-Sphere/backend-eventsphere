import { Response, Request } from "express";
import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import {
  EventInterface,
  MainEventInterface,
  SubEventInterface,
} from "../../Interfaces/eventInterface";
import { EventClass } from "./eventClass";
import { FirebaseStorage } from "../../Services/Storage";
import moment from "moment";
import { categoryInterface } from "../../Interfaces/categoryInterface";

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
    "starting_date",
    "hostedBy",
    "host_email",
    "host_mobile",
    "c_code",
    "ticket_quantity",
    "ticket_sold",
    "ticket_type",
    "ticket_price",
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

    const mainImgFile = imageList.main_image;

    if (mainImgFile === null || mainImgFile === undefined) {
      return ApiResponseHandler.error(res, "Main event image is required", 400);
    }

    const coverImgFiles = imageList.cover_images;
    if (
      coverImgFiles === null ||
      coverImgFiles === undefined ||
      Object.keys(coverImgFiles).length === 0
    ) {
      return ApiResponseHandler.error(res, "Cover Images are required", 400);
    }

    const imgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadSingleImage(
        `events/${data._id}`,
        mainImgFile
      );
    if (imgUploadedResponse.status === false) {
      return ApiResponseHandler.error(
        res,
        imgUploadedResponse.message ??
          "failed to upload main event images. try again!",
        500
      );
    }

    const coverImgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadCoverImages(
        `events/${data._id}/coverImages`,
        coverImgFiles
      );
    if (coverImgUploadedResponse.status === false) {
      return ApiResponseHandler.error(
        res,
        "failed to upload cover images. try again later",
        500
      );
    }

    const subEventIds: any[] = [];
    const subEventsData: SubEventInterface[] = [];

    let idx = 0;
    for (let subEvent of data.sub_events) {
      if (!isValidSubEventData(subEvent)) {
        return ApiResponseHandler.error(
          res,
          `Invalid sub-event data: ${subEvent}`,
          400
        );
      }

      subEventIds.push(subEvent._id);
      const subCoverGroupKey = `sub_cover_images${idx + 1}`;
      idx += 1;

      const subEventCoverImgFile = imageList.sub_cover_images[subCoverGroupKey];

      const coverImgUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadSubEventCoverImages(
          `'events'/${data._id}/subevents/${subEvent._id}}`,
          subEventCoverImgFile
        );
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

    subEventsData.map((d) => {
      console.log(d);
    });

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

    const updateOrganizerEventCount =
      await eventInstance.updateOrganizationEventCounts(
        mainEvents.org_id,
        subEventIds
      );
    if (updateOrganizerEventCount.status === false) {
      console.log(
        "call the fn again to update count of the envent and organization pending events as well"
      );
    }
  } catch (err) {
    console.error("Error creating event:", err);
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

export const updateEvent = async (req: Request, res: Response, next: any) => {
  try {
    // if you have new subEvents then add cover image files like eg(sub_cover_images[here id of the subEvent] : [list of image files])
    const { eventId, mainEventData, subEventsData } = req.body;
    const subEventsCoverFiles = req.body.files;

    if (!eventId) {
      return ApiResponseHandler.error(res, "Event ID is required.", 400);
    }

    const existingEvent = await eventInstance.getEventById(eventId);

    if (!existingEvent) {
      return ApiResponseHandler.error(res, "Event not found.", 404);
    }

    if (!mainEventData) {
      return ApiResponseHandler.error(res, "Main event data is required.", 400);
    }

    const requiredMainFields = [
      "_id",
      "name",
      "location",
      "org_id",
      "description",
      "registration_start",
      "registration_end",
      "longitude",
      "latitude",
      "category",
      "tags",
      "audience_type",
      "currency",
      "main_image",
      "cover_images",
      "is_main",
    ];

    for (const field of requiredMainFields) {
      if (!mainEventData[field] || mainEventData[field] === "") {
        return ApiResponseHandler.error(
          res,
          `Field ${field} is required and cannot be empty.`,
          400
        );
      }
    }


    for(let subEvent of subEventsData){
      const requiredSubFields = [
        "name",
        "description",
        "start_time",
        "end_time",
        "starting_date",
        "hostedBy",
        "host_email",
        "host_mobile",
        "c_code",
        "ticket_quantity",
        "ticket_sold",
        "ticket_type",
        "ticket_price",
        "restrictions",
      ];

      for (const field of requiredSubFields) {
        if (!subEvent[field] || subEvent[field] === "") {
          return ApiResponseHandler.error(
            res,
            `Field ${field} in sub-event is required and cannot be empty.`,
            400
          );
        }
      }
    }

    const updatedMainEventData: MainEventInterface = {
      ...mainEventData,
      registration_start: moment(mainEventData.registration_start).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      registration_end: moment(mainEventData.registration_end).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      tags: JSON.stringify(mainEventData.tags),
      audience_type: mainEventData.audience_type,
    };

    const existingSubEventIds = JSON.parse(
      existingEvent.data.sub_event_items || "[]"
    );

    const mappedSubEventsCoverFiles: Record<string, any> = {};
    if (subEventsCoverFiles) {
      for (const key in subEventsCoverFiles) {
        const match = key.match(/sub_cover_images(\d+)/);
        if (match) {
          const subEventId = match[1];
          if (!mappedSubEventsCoverFiles[subEventId]) {
            mappedSubEventsCoverFiles[subEventId] = [];
          }
          mappedSubEventsCoverFiles[subEventId].push(subEventsCoverFiles[key]);
        }
      }
    }

    const updatedSubEvents: SubEventInterface[] = [];
    const subEventIdsToDelete = new Set(existingSubEventIds);
    const newSubEventIds: number[] = [];


    for (let subEvent of subEventsData) {
      if (!existingSubEventIds.includes(subEvent._id)) {
        if (mappedSubEventsCoverFiles[subEvent._id]) {
          const coverImages = mappedSubEventsCoverFiles[subEvent._id];
          const coverImgUploadedResponse =
            await FirebaseStorage.uploadCoverImages(
              `events/${eventId}/subevents/${subEvent._id}`,
              coverImages
            );

          if (coverImgUploadedResponse.status === false) {
            return ApiResponseHandler.error(
              res,
              `Failed to upload cover images for sub-event ${subEvent.name}. Try again later.`,
              500
            );
          }

          subEvent.cover_images = JSON.stringify(coverImgUploadedResponse.urls);
        }

        const newId = await eventInstance.createSubEventById(
          mainEventData._id,
          subEvent
        );

        subEvent._id = newId;
        newSubEventIds.push(subEvent._id);
      }

      const subEventUpdate: SubEventInterface = {
        ...subEvent,
        start_time: moment(subEvent.start_time).format("HH:mm:ss"),
        end_time: moment(subEvent.end_time).format("HH:mm:ss"),
        starting_date: moment(subEvent.starting_date).format("YYYY-MM-DD"),
        restrictions: JSON.stringify(subEvent.restrictions),
      };

      updatedSubEvents.push(subEventUpdate);
      subEventIdsToDelete.delete(subEvent._id);
    }
            
    const response: any = await eventInstance.updateEvent(
      eventId,
      updatedMainEventData,
      updatedSubEvents,
      subEventIdsToDelete,
      existingSubEventIds,
      newSubEventIds
    );

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        response.message ?? "Failed to update event",
        500
      );
    }

    return ApiResponseHandler.success(
      res,
      { eventId, updatedMainEventData, updatedSubEvents },
      "Event updated successfully."
    );
  } catch (err) {
    return ApiResponseHandler.error(res, "Internal server error", 500);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.file) {
      return ApiResponseHandler.error(
        res,
        "Missing required data in the request. Please provide the necessary category information.",
        400
      );
    }

    const categoryName = req.body.name;
    const categoryImageFile = req.body.file;

    if (!categoryName) {
      return ApiResponseHandler.error(res, "Category name is required.", 400);
    }

    if (!categoryImageFile) {
      return ApiResponseHandler.error(res, "Category image is required.", 400);
    }

    const categoryId = Date.now() + Math.floor(Math.random() * 1000);

    const imgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadSingleImage(
        `categories/${categoryId}`,
        categoryImageFile
      );
    if (!imgUploadedResponse.status) {
      return ApiResponseHandler.error(
        res,
        imgUploadedResponse.message ??
          "failed to upload main event images. try again!",
        500
      );
    }

    const categoryData: categoryInterface = {
      _id: categoryId,
      name: categoryName,
      image: imgUploadedResponse.url,
      is_enable: 1,
    };

    const response: any = await eventInstance.createCategory(categoryData);

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        response.message ?? "failed to create category. try after sometime",
        500
      );
    }

    return ApiResponseHandler.success(
      res,
      response.data,
      "Category created successfully.",
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(
      res,
      error.message ?? "internal server error",
      500
    );
  }
};

export const updateCategoryByID = async (req: Request, res: Response) => {
  try {
    if (!req.body.name && !req.body.file) {
      return ApiResponseHandler.error(
        res,
        "Missing required data in the request. Please provide the necessary category information.",
        400
      );
    }

    const bodyData = req.body.data;
    const categoryImageFile = req.body.file;

    if (!categoryImageFile) {
      return ApiResponseHandler.error(res, "Category image is required.", 400);
    }

    const categoryExists = await eventInstance.getCategoryById(bodyData._id);

    if (!categoryExists) {
      return ApiResponseHandler.error(res, "Category not exists", 500);
    }

    let imageUrl = bodyData.image;

    if (req.body.file) {
      const imgUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadSingleImage(
          `categories/${bodyData._id}`,
          categoryImageFile
        );
      imageUrl =
        imgUploadedResponse.status === true
          ? imgUploadedResponse.url
          : bodyData.image;
    }

    const categoryUpdatedData: categoryInterface = {
      _id: bodyData._id,
      name: bodyData.name,
      image: imageUrl,
      is_enable: bodyData.is_enable ?? 1,
    };

    const response: any = await eventInstance.updateCategory(
      categoryUpdatedData
    );

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        response.message ?? "failed to update category. try after sometime",
        500
      );
    }

    return ApiResponseHandler.success(
      res,
      response.data,
      "Category updated successfully.",
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(
      res,
      error.message ?? "internal server error",
      500
    );
  }
};

export const deteleCategoryByID = async (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      return ApiResponseHandler.error(res, "missing category key", 400);
    }

    const categoryExists = await eventInstance.getCategoryById(req.body._id);

    if (!categoryExists.status) {
      return ApiResponseHandler.error(res, "Category not exists", 500);
    }

    const response: any = await eventInstance.deleteCategoryById(
      categoryExists.data._id
    );

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        response.message ?? "failed to delete category. Try again!.",
        500
      );
    }

    return ApiResponseHandler.success(res, [], response.message, 200);
  } catch (error: any) {
    return ApiResponseHandler.error(
      res,
      error.message ?? "internal server error",
      500
    );
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      return ApiResponseHandler.error(res, "Missing category key", 400);
    }

    const response: any = await eventInstance.getCategoryById(req.body._id);

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        `${response.message ?? "Category not exists"}`,
        500
      );
    }
    return ApiResponseHandler.success(
      res,
      response.data,
      response.message,
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(
      res,
      error.message ?? "internal server error",
      500
    );
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const response: any = await eventInstance.getAllCategories();
    return ApiResponseHandler.success(
      res,
      response.data ?? [],
      response.message ?? "categories list successfully getted.",
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(
      res,
      error.message ?? "internal server error",
      500
    );
  }
};
