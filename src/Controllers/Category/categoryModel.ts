import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import { Request , Response } from "express";
import { FirebaseStorage } from "../../Services/Storage";
import { categoryInterface } from "../../Interfaces/categoryInterface";
import { CategoryClass } from "./categoryClass";


const categoryInstance = new CategoryClass();

interface FileStorageResponse {
    status: boolean;
    message?: string;
    url?: any;
    urls?: any;
  }


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
  
      const response: any = await categoryInstance.createCategory(categoryData);
  
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
  
      const categoryExists = await categoryInstance.getCategoryById(bodyData._id);
  
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
  
      const response: any = await categoryInstance.updateCategory(
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
  
      const categoryExists = await categoryInstance.getCategoryById(req.body._id);
  
      if (!categoryExists.status) {
        return ApiResponseHandler.error(res, "Category not exists", 500);
      }
  
      const response: any = await categoryInstance.deleteCategoryById(
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
  
      const response: any = await categoryInstance.getCategoryById(req.body._id);
  
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
      const response: any = await categoryInstance.getAllCategories();
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
  