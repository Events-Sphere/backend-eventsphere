import multer, { Multer } from "multer";
import { Request, Response, NextFunction } from "express";
import { ApiResponseHandler } from "./Api-response-handler";

export class ImageParser {
  private upload: Multer;

  constructor() {
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      this.upload.any()(req, res, (err) => {
        if (err) {
          console.error("Error parsing files:", err);
          return ApiResponseHandler.error(res, err.message, 500);
        }

        const files = req.files as Express.Multer.File[] | undefined;

        req.body.files = files
          ? files.map((file) => ({
              fieldname: file.fieldname,
              originalname: file.originalname,
              encoding: file.encoding,
              mimetype: file.mimetype,
              size: file.size,
              buffer: file.buffer,
            }))
          : [];

        next();
      });
    };
  }
}
