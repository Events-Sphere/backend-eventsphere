import { ApiResponseHandler } from "../../Middleware/apiResponseMiddleware";
import { Request, Response } from "express";
import { FirebaseStorage } from "../../Services/Storage";
import { categoryInterface } from "../../Interfaces/categoryInterface";
import { CategoryClass } from "./categoryClass";
import { COMMON_MESSAGES } from "../../Common/messages";

const categoryInstance = new CategoryClass();

interface FileStorageResponse {
  status: boolean;
  message?: string;
  url?: any;
  urls?: any;
}


export const createCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName,file:categoryImageFile } = req.body;
    console.log(req.body.categoryName);
console.log({name: categoryName, file: categoryImageFile })
    if (!categoryName || !categoryImageFile) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.VALIDATION_ERROR,
        400
      );
    }

    const imgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadSingleImage(
        `categories/CATEGORY IMAGES`,
        categoryImageFile
      );

    if (!imgUploadedResponse.status) {
      return ApiResponseHandler.error(
        res,
        imgUploadedResponse.message ?? "Failed to upload category image.",
        500
      );
    }

    const categoryData: categoryInterface = {
      name: categoryName,
      image: imgUploadedResponse.url,
      is_enable: 1,
    };

    const response = await categoryInstance.createCategory(categoryData);

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.CATEGORY_CREATION_FAILED,
        500
      );
    }

    return ApiResponseHandler.success(
      res,
      response.data,
      COMMON_MESSAGES.CATEGORY_CREATED,
      200
    );
  } catch (error: any) {
    console.log(error)
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};

export const updateCategoryByID = async (req: Request, res: Response) => {
  try {
    const { data: bodyData, file: categoryImageFile } = req.body;

    if (!bodyData || (!bodyData.name && !categoryImageFile)) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.VALIDATION_ERROR,
        400
      );
    }

    const categoryExists = await categoryInstance.getCategoryById(bodyData._id);

    if (!categoryExists.status) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.CATEGORY_NOT_FOUND,
        404
      );
    }

    let imageUrl = bodyData.image;

    if (categoryImageFile) {
      const imgUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadSingleImage(
          `categories/CATEGORY IMAGES`,
          categoryImageFile
        );

      if (imgUploadedResponse.status) {
        imageUrl = imgUploadedResponse.url;
      }
    }

    const categoryUpdatedData: categoryInterface = {
      _id: bodyData._id,
      name: bodyData.name,
      image: imageUrl,
      is_enable: bodyData.is_enable ?? 1,
    };

    const response : any = await categoryInstance.updateCategory(categoryUpdatedData);

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.CATEGORY_UPDATE_FAILED,
        500
      );
    }

    return ApiResponseHandler.success(
      res,
      response.data,
      COMMON_MESSAGES.CATEGORY_UPDATED,
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};

export const deleteCategoryByID = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.VALIDATION_ERROR,
        400
      );
    }

    const categoryExists = await categoryInstance.getCategoryById(_id);

    if (!categoryExists.status) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.CATEGORY_NOT_FOUND,
        404
      );
    }

    const response = await categoryInstance.deleteCategoryById(_id);

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.CATEGORY_DELETION_FAILED,
        500
      );
    }

    return ApiResponseHandler.success(res, [], COMMON_MESSAGES.CATEGORY_DELETED, 200);
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.VALIDATION_ERROR,
        400
      );
    }

    const response = await categoryInstance.getCategoryById(_id);

    if (!response.status) {
      return ApiResponseHandler.error(
        res,
        COMMON_MESSAGES.CATEGORY_NOT_FOUND,
        404
      );
    }

    return ApiResponseHandler.success(
      res,
      response.data,
      COMMON_MESSAGES.CATEGORY_FETCHED,
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const response = await categoryInstance.getAllCategories();

    return ApiResponseHandler.success(
      res,
      response.data ?? [],
      COMMON_MESSAGES.CATEGORIES_FETCHED,
      200
    );
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};
