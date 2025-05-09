import e, { NextFunction, Request, Response } from "express";
import { Iuser } from "../types/express";
import { ApiResponseHandler } from "./apiResponseMiddleware";
import jwt from "jsonwebtoken";
import db from "../Config/knex";
import catchAsyncError from "./errorMiddleware";
import CustomError from "../Utililes/customError";
import { tableName } from "../tables/table";
 class AuthenticateUser {
  // static async verifyToken(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const token = req.headers["authorization"];

  //     const isToken = token && token.split(" ")[1];
  //     if (!isToken) {
  //       return ApiResponseHandler.error(res, "Token not found", 403);
  //     }
  //     const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
  //     jwt.verify(isToken, SECRET_KEY, (error, data) => {
  //       if (error) {
  //         console.log(error)
  //         if (error.name === "TokenExpiredError") {
  //           return ApiResponseHandler.error(res, "Token expired", 401);
  //         }
  //         return ApiResponseHandler.error(res, "Invalid token", 401);
  //       }
  //       req.user = data as Iuser;
  //       next();
  //     });
  //   } catch (error: any) {
  //     console.log(error)
  //     return ApiResponseHandler.error(res, "Internal server error", 501);
  //   }
  // }

  verifyToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers["authorization"];
    const isToken = token && token.split(" ")[1];
    if (!isToken) {
      return next(new CustomError("Token not found", 403))
    }
    const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
    jwt.verify(isToken, SECRET_KEY, (error, data) => {
      if (error) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
          return next(new CustomError("Token expired", 401))
        }
        return next(new CustomError("Invalid token", 401))
      }
      req.user = data as Iuser;
      next();
    });
  })

  isUserFound = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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

  })

  isSquad = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user?.id || !user?.role) {
      return ApiResponseHandler.error(res, "Token invalid", 401);
    }
    if(user.role == "squad"){
      const isSquad = await db.select("*").from("users").where({ _id: user.id }).andWhere({role:user.role});
      console.log(isSquad.length)
    if (isSquad.length <= 0) {
      return ApiResponseHandler.error(res, "squard not found", 401);
    } 
     return next();
    }
    return next(new CustomError("you not have access to use this route", 401))
  })

  isAdmin = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    if (!user?.id || !user?.role) {
      return next(new CustomError("Token Invalid", 401))
    }
    if (user.role === "admin") {
      const admin = await db
        .select("*")
        .from(tableName.ADMIN)
        .where({ _id: user.id });

      if (admin.length <= 0) {
        return next(new CustomError("Admin not found", 404))
      }
    return next();
    }
    return next(new CustomError("you not have access to use this route", 401))


  })

  // static async isAdmin(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const user = req.user;

  //     if (!user?.id || !user?.role) {
  //       return ApiResponseHandler.error(res, "Token invalid", 401);
  //     }
  //     if (user.role === "admin") {
  //       const isAdmin = await db
  //         .select("*")
  //         .from("users")
  //         .where({ _id: user.id });
  //       if (isAdmin.length <= 0) {
  //         return ApiResponseHandler.error(res, "Admin not found", 401);
  //       }
  //       next();
  //     } else {
  //       return ApiResponseHandler.error(
  //         res,
  //         "you not have access to use this route",
  //         401
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     return ApiResponseHandler.error(res, "Internal server error", 501);
  //   }
  // }

  isOrganizerHaveAccess = catchAsyncError(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

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

  }
  )


  isUserHaveAccess = catchAsyncError(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    const user = req.user;

    if (!user?.id || !user?.role) {
      return ApiResponseHandler.error(res, "Token invalid", 401);
    }
    // console.log(`User Id : ${user.id}`);
    // console.log(`User Role : ${user.role}`);

    if (user.role === "user") {
      const isUser = await db
        .select("*")
        .from("users")
        .where({ _id: user.id, role: "user" });
      if (isUser.length <= 0) {
        return ApiResponseHandler.error(res, "user not found", 401);
      }

      // console.log(`User Status : ${isUser[0].status}`)

      if (isUser[0].status === "inactive") {
        return ApiResponseHandler.error(
          res,
          "user is not verified user",
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
    } else {
      return ApiResponseHandler.error(
        res,
        "you not have access to use this route",
        401
      );
    }
  })
}


export default AuthenticateUser;