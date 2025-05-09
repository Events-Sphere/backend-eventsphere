import { Response, Request, NextFunction } from "express";
import catchAsyncError from "../Middleware/errorMiddleware";
import EventCategoryClass from "../classes/eventCategoryClass";
import { FirebaseStorage } from "../Services/Storage";
import { categoryInterface } from "../Interfaces/categoryInterface";
import CustomError from "../Utililes/customError";

const eventCategory = new EventCategoryClass();

interface FileStorageResponse {
    status: boolean;
    message?: string;
    url?: any;
    urls?: any;
}

class EventCategoryModel {

    getAllCategories = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        const {limit = 10, search = "", page = 1 } = req.body;
        const offset=(page-1)*10
        const {categories,totalPage,totalRecords} = await eventCategory.getAllCategories(search,limit,offset);
        res.status(200).json({
            success: true,
            data: {
                categories,
                totalPage,
                totalRecords
            },
            message: "Category"
        })
    }
    );

    createCategory = catchAsyncError(
        async (req: Request, res: Response, next: NextFunction) => {
            const { categoryName, file: categoryImageFile } = req.body;
            if (!categoryName || !categoryImageFile) {
                return next(new CustomError("Category name or file missing", 400))
            }

            const isCategoryExists = await eventCategory.isCategoryExistsOrNot(categoryName)
            if (isCategoryExists) {
                return next(new CustomError("Category name already registered", 400))
            }

            const imgUploadedResponse: FileStorageResponse =
                await FirebaseStorage.uploadSingleImage(
                    `categories/CATEGORY IMAGES`,
                    categoryImageFile
                );
            if (!imgUploadedResponse.status) {
                return next(new CustomError(imgUploadedResponse.message ?? "Failed to upload category image."))
            }
            const categoryData: categoryInterface = {
                name: categoryName,
                image: imgUploadedResponse.url,
                is_enable: 1,
            };
            const response = await eventCategory.createCategory(categoryData);
            res.status(200).json({
                success: true,
                data: null,
                message: "Category created successfully"
            })
        }
    );

    deleteCategory = catchAsyncError(
        async (req: Request, res: Response, next: NextFunction) => {
            // const data = await eventCategory.getAllCategories();
            // res.status(200).json({
            //     success: true,
            //     data: data,
            //     message: "Category"
            // })
        }
    );

}


export default EventCategoryModel;