
import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../Middleware/errorMiddleware";
import { UserClass } from "../classes/userClass";
import CustomError from "../Utililes/customError";
import { Validators } from "../Utililes/validators";
import { PasswordEncryption } from "../Utililes/passwordEncryption";
import { FirebaseStorage } from "../Services/Storage";
import MailServices from "../Utililes/mailServices";
import TicketServices from "../Utililes/ticketServices";
const user = new UserClass;
const mail = new MailServices
const pdf = new TicketServices
interface FileStorageResponse {
  status: boolean;
  message?: string;
  url?: any;
  urls?: any;
}
class UserModel {

  private isValidData = (data: any, fields: string[]): boolean => {
    return fields.every(
      (field) => typeof data[field] === "string" && data[field].trim() !== ""
    );
  };


  getAllUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    const { status = ["all"], limit = 10, search = "", page = 1 } = req.body;

    const offset = (page - 1) * 10
    const { users, totalPage, totalRecords } = await user.getUsersByRole("user", status, search, offset, limit);
    return res.status(200).json({
      status: true,
      data: {
        users: users,
        totalPage: totalPage,
        totalRecords: totalRecords
      },
      message: "Users"
    })
  }
  );

  getUserById = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userData = await user.getUserById(Number(req.body._id));
    return res.status(200).json({
      status: true,
      data: {
        users: userData
      },
      message: "User detail retrieved successfully"
    })
  }
  );

  getAllOrganizers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const { organizers, totalPage, totalRecords } = await user.getUsersByRole("organizer", status, search, offset, limit)
    return res.status(200).json({
      status: true,
      data: {
        organizers: organizers,
        totalPage: totalPage,
        totalRecords: totalRecords
      },
      message: "Organizers"
    })
  }
  );
  getOrganizerById = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userData = await user.getUserById(Number(req.body._id));
    return res.status(200).json({
      status: true,
      data: {
        users: userData
      },
      message: "Organizer detail retrieved successfully"
    })
  }
  );

  getAllSquads = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const { squads, totalPage, totalRecords } = await user.getUsersByRole("squad", status, search, offset, limit)
    return res.status(200).json({
      status: true,
      data: {
        squads: squads,
        totalPage: totalPage,
        totalRecords: totalRecords
      },
      message: "Squads"
    })
  }
  );

  getAllPendingUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const users = await user.getUsersByRoleAndStatus("user", "pending");
    return res.status(200).json({
      status: true,
      data: users,
      message: "Users are retrieved successfully"
    })
  });

  getAllPendingOrganizers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    // const ticketPdf = await pdf.generateTicketPdf();
    // const mailData = await mail.sendMailToUser(ticketPdf);
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const organizers = await user.getUsersByRoleAndStatus("organizer", "pending");
    return res.status(200).json({
      status: true,
      data: organizers,
      message: "Organizers"
    })
  });

  getAllActiveUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const users = await user.getUsersByRoleAndStatus("user", "active");
    return res.status(200).json({
      status: true,
      data: users,
      message: "Users"
    })
  });

  getAllActiveOrganizers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const organizers = await user.getUsersByRoleAndStatus("organizer", "active");
    return res.status(200).json({
      status: true,
      data: organizers,
      message: "Organizers"
    })
  })

  getAllRejectedUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const users = await user.getUsersByRoleAndStatus("user", "rejected");
    return res.status(200).json({
      status: true,
      data: users,
      message: "Users"
    })
  });

  getAllRejectedOrganizers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { status = "all", limit = 10, search = "", page = 1 } = req.body;
    const offset = (page - 1) * 10
    const organizers = await user.getUsersByRoleAndStatus("organizer", "rejected");
    return res.status(200).json({
      status: true,
      data: organizers,
      message: "Organizers"
    })
  });

  getUserProfileByRoleAndId = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userData = req.user;
      if (!userData?.id || !userData?.role) {
        return next(new CustomError("User id or role missing", 400))
      }
      const role: string = userData.role;
      const id: number = userData.id;
      const userResponse = await user.getUserProfileByRoleAndId(role, id)
      console.log(userResponse)
      if (!userResponse) {
        return next(new CustomError("user not found", 404))
      }
      res.status(200).json({
        success: true,
        data: userResponse,
        message: "User"
      })
    }
  );

  createSquad = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {

      //PENDING-->  upload profile pic in firestore
      const approvedBy = req.user!.id;
      if (!approvedBy) {
        return next(new CustomError("Approver id missing", 400))
      }
      if (!req.body.data) {
        return next(new CustomError("Data is missing", 401))
      }

      const files = req.files as Express.Multer.File[];
      if (!req.files || !files[0]) {
        return next(new CustomError("Image is missing", 401))
      }
      const squardData = JSON.parse(req.body.data);
      const requiredFields = [
        "name",
        "email",
        "password",
        "c_code",
        "mobile",
        "location",
      ];

      if (!this.isValidData(squardData, requiredFields)) {
        return next(new CustomError("All fields are required", 401))
      }

      if (!Validators.isValidEmail(squardData.email)) {
        return next(new CustomError("Enter valid email", 401))
      }

      if (!Validators.isValidMobile(squardData.mobile)) {
        return next(new CustomError("Enter valid mobile", 401))
      }

      if (!Validators.isValidPassword(squardData.password)) {
        return next(new CustomError("Enter valid password", 401))
      }

      const isSquardExists: any = await user.isUserExistsOnMobileOrEmail(
        squardData.email,
        squardData.mobile
      );
      console.log("squad" + isSquardExists)

      if (!isSquardExists || isSquardExists.length > 0) {
        return next(new CustomError("Email or Mobile already in use", 401))
      }
      const hashedPassword = await PasswordEncryption.hashPassword(
        squardData.password
      );
      squardData.password = hashedPassword;

      const profileUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadSingleImage(`USERS/PROFILE`, files[0]);
      if (profileUploadedResponse.status === false) {
        return next(new CustomError("failed to upload Profile . try again!"))
      }


      const updateSquard = { ...squardData, profile: profileUploadedResponse.url, approvedBy: approvedBy }
      const squard = await user.createSquad(updateSquard);
      res.status(200).json({
        success: true,
        data: null,
        message: "Squard created"
      })
    }
  )


  createAdmin = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.body) {
        return next(new CustomError("Data is missing", 401))
      }
      if (!Validators.isValidEmail(req.body.email)) {
        return next(new CustomError("Enter valid email", 401))
      }
      if (!Validators.isValidPassword(req.body.password)) {
        return next(new CustomError("Enter valid password", 401))
      }
      const hashedPassword = await PasswordEncryption.hashPassword(
        req.body.password
      );
      const admin = await user.createAdmin(req.body.email, hashedPassword);
      res.status(200).json({
        success: true,
        data: null,
        message: "admin created"
      })
    }
  )
}

export default UserModel;