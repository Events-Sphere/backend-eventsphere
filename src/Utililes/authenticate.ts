import { Request, Response } from "express";
import { ApiResponseHandler } from "../Middleware/Api-response-handler";
import jwt from "jsonwebtoken";

export class Authenticate {
  static async isAuthenticated(req: Request, res: Response) {
    try {
      
    } catch (error) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }
}
