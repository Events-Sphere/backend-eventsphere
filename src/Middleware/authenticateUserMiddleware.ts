import { NextFunction, Request, Response } from "express";
import { Iuser } from "../types/express";
import { ApiResponseHandler } from "./apiResponseMiddleware";
import jwt from "jsonwebtoken";
import db from "../Config/knex";
export class AuthenticateUser {
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers["authorization"];

      const isToken = token && token.split(" ")[1];
      if (!isToken) {
        return ApiResponseHandler.error(res, "Token not found", 403);
      }
      const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
      jwt.verify(isToken, SECRET_KEY, (error, data) => {
        if (error) {
          if (error.name === "TokenExpiredError") {
            return ApiResponseHandler.error(res, "Token expired", 401);
          }
          return ApiResponseHandler.error(res, "Invalid token", 401);
        }

        req.user = data as Iuser;
        next();
      });
    } catch (error: any) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }

  static async isUserFound(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user?.id || !user?.role) {
        return ApiResponseHandler.error(res, "Token invalid", 401);
      }

      const isUser = await db.select("*").from("users").where({ _id: user.id });
      if (isUser.length <= 0) {
        return ApiResponseHandler.error(res, "User not found", 401);
      } else {
        next();
      }
    } catch (error) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }

  static async isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user?.id || !user?.role) {
        return ApiResponseHandler.error(res, "Token invalid", 401);
      }
      if (user.role === "admin") {
        const isAdmin = await db
          .select("*")
          .from("admin")
          .where({ _id: user.id });
        if (isAdmin.length <= 0) {
          return ApiResponseHandler.error(res, "Admin not found", 401);
        }
        next();
      } else {
        return ApiResponseHandler.error(
          res,
          "you not have access to use this route",
          401
        );
      }
    } catch (error) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }

  static async isOrganizerHaveAccess(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      console.log(user);

      if (!user?.id || !user?.role) {
        return ApiResponseHandler.error(res, "Token invalid", 401);
      }

      if (user.role === "organizer") {
        const isOrganizer = await db
          .select("*")
          .from("users")
          .where({ _id: user.id, role: "organizer" });

        if (isOrganizer.length <= 0) {
          return ApiResponseHandler.error(res, "organizer not found", 401);
        }

        if (isOrganizer[0].status === "inactive") {
          return ApiResponseHandler.error(
            res,
            "Organizer is verified request is pending..you are not allowed to create event",
            401
          );
        }
        if (isOrganizer[0].status === "rejected") {
          return ApiResponseHandler.error(
            res,
            "Organizer is verified request is rejected..you are not allowed to create event",
            401
          );
        }
        next();
      } else {
        return ApiResponseHandler.error(
          res,
          "you not have access to use this route",
          401
        );
      }
    } catch (error) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }

  static async isUserHaveAccess(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;

      if (!user?.id || !user?.role) {
        return ApiResponseHandler.error(res, "Token invalid", 401);
      }
      console.log(`User Id : ${user.id}`);
      console.log(`User Role : ${user.role}`);

      if (user.role === "user") {
        const isUser = await db
          .select("*")
          .from("users")
          .where({ _id: user.id, role: "user" });
        if (isUser.length <= 0) {
          return ApiResponseHandler.error(res, "user not found", 401);
        }

        console.log(`User Status : ${isUser[0].status}`)

        if (isUser[0].status === "pending") {
          return ApiResponseHandler.error(
            res,
            "user is verified request is pending..you are not allowed to create event",
            401
          );
        }
        if (isUser[0].status === "rejected") {
          return ApiResponseHandler.error(
            res,
            "user is verified request is rejected..you are not allowed to create event",
            401
          );
        }

        next();
      }else
      {
        return ApiResponseHandler.error(
          res,
          "you not have access to use this route",
          401
        );
      }

      
    } catch (error) {
      return ApiResponseHandler.error(res, "Internal server error", 501);
    }
  }
}
