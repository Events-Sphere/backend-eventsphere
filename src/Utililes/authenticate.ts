import { NextFunction, Request, Response } from "express";
import { ApiResponseHandler } from "../Middleware/apiResponseMiddleware";
import jwt from "jsonwebtoken";
import { Iuser } from "../types/express";
import db from "../Config/knex";

export class Authenticate {
  
  static async generateToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.headers["authorization"];
      const isToken = token && token.split(" ")[1];
      if (!isToken) {
        return ApiResponseHandler.error(res, "Token not found", 403);
      }
      const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
      jwt.verify(token, SECRET_KEY, (error, data) => {
        if (error) {
          return ApiResponseHandler.error(res, "Invalid token", 401);
        }
        req.user = data as Iuser;
      });
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return ApiResponseHandler.error(res, "Token expired", 401);
      }
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }






  static isAthorized(roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (!user?.id || !user?.role) {
          return ApiResponseHandler.error(res, "Token invalid", 401);
        }

        if (!roles.includes(user.role)) {
          return ApiResponseHandler.error(
            res,
            "User not allowed to access this route",
            401
          );
        }

        if (user.role === "admin") {
          const isAdmin = await db
            .select("*")
            .from("admin")
            .where({ _id: user.id });
          if (isAdmin.length <= 0) {
            return ApiResponseHandler.error(res, "Admin not found", 401);
          }
          return next();
        }
        const isUser = await db
          .select("*")
          .from("users")
          .where({ _id: user.id, role: user.role });
        if (isUser.length <= 0) {
          return ApiResponseHandler.error(res, "user not found", 401);
        }
        next();
      } catch (error) {
        return ApiResponseHandler.error(res, "Internal server error", 501);
      }
    };
  }

  
  static async isVerifiedUser(req: Request, res: Response, next: NextFunction){
    try {
      const user = req.user;
      const isUser = await db
          .select("*")
          .from("users")
          .where({ _id: user!.id, role: user!.role });
          if (isUser[0].status === "inactive") {
            return ApiResponseHandler.error(res, "User is not a verified..", 401);
          }
          if (isUser[0].status === "pending") {
            return ApiResponseHandler.error(res, "User is verified request is pending..", 401);
          }
          if (isUser[0].status === "active") {
            return next();
          }
          return ApiResponseHandler.error(res, "Internal server error", 501);
    } catch (error) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }
}
