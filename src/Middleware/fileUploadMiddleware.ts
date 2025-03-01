import { Request, Response, NextFunction } from "express";
import { ApiResponseHandler } from "./apiResponseMiddleware";
import multer, { Multer } from "multer";

export class FileUploadMiddleware {
  private readonly upload: Multer;

  constructor() {
    this.upload = multer();
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      this.upload.any()(req, res, (err) => {
        if (err) {
          console.error("Error parsing files:", err);
          return ApiResponseHandler.error(res, "File upload error: " + err.message, 500);
        }

        const files = req.files as Express.Multer.File[] | undefined;

        if (!files || files.length === 0) {
          return ApiResponseHandler.error(
            res,
            "No files were uploaded. Please provide at least one file.",
            400
          );
        }

        const MAX_FILE_SIZE = 15 * 1024 * 1024; 
        const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf","application/octet-stream"];

        
        const invalidFiles = files.filter(
          (file) => file.size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.includes(file.mimetype)
        );
        console.log(invalidFiles)

        if (invalidFiles.length > 0) {
          return ApiResponseHandler.error(
            res,
            "Some files are invalid. Ensure each file is under 15MB and of an allowed type (JPEG, PNG, PDF).",
            400
          );
        }

        
        if (files.length === 1) {
          req.body.file = {
            fieldname: files[0].fieldname,
            originalname: files[0].originalname,
            encoding: files[0].encoding,
            mimetype: files[0].mimetype,
            size: files[0].size,
            buffer: files[0].buffer,
          };
        } else {
          req.body.files = files.map((file) => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.buffer,
          }));
        }

        next();
      });
    };
  }
}