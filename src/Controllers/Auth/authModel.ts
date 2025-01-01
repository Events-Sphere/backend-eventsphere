import { AuthClass } from "./authClass";
import { Request, Response } from "express";
import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import { Validators } from "../../Utililes/validators";
import { PasswordEncryption } from "../../Utililes/passwordEncryption";
import db from "../../Config/knex";

const authInstance = new AuthClass();

const isValidData = (data: any, fields: string[]): boolean => {
  return fields.every(
    (field) => typeof data[field] === "string" && data[field].trim() !== ""
  );
};

//LOGIN ENDPOINT--> http://localhost:3000/auth/login

export const login = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    if (!isValidData(userData, ["email", "password"])) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }

    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", 401);
    }

    const responseData: any[] = await authInstance.userLogin(userData);

    if (responseData.length <= 0) {
      return ApiResponseHandler.warning(
        res,
        "No user found with provided credentials",
        401
      );
    }

    const isPasswordCorrect = await PasswordEncryption.comparePassword(
      userData.password,
      responseData[0].password
    );

    if (!isPasswordCorrect) {
      return ApiResponseHandler.warning(
        res,
        "Password does not match with your credentials",
        401
      );
    }

    return ApiResponseHandler.success(res, null, "Login Successful", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//SIGNUP ENDPOINT--> http://localhost:3000/auth/signup

export const signup = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    if (!userData.role) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }

    const requiredFields =
      userData.role !== "organizer"
        ? ["name", "email", "ccode", "mobile", "role", "password", "location"]
        : [
            "name",
            "email",
            "ccode",
            "mobile",
            "role",
            "password",
            "location",
            "proof",
            "longitude",
            "latitude",
            "collegeName",
            "collegeCode",
            "collegeNoc",
          ];

    if (!isValidData(userData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }

    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", 401);
    }

    if (!Validators.isValidMobile(userData.mobile)) {
      return ApiResponseHandler.warning(res, "Enter valid mobile", 401);
    }

    if (!Validators.isValidPassword(userData.password)) {
      return ApiResponseHandler.warning(
        res,
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*())",
        401
      );
    }

    const isUserExists: any[] = await authInstance.isUserExists(
      userData.email,
      userData.mobile
    );
    if (isUserExists.length > 0) {
      return ApiResponseHandler.warning(
        res,
        "Email or Mobile already in use",
        401
      );
    }

    const hashedPassword = await PasswordEncryption.hashPassword(
      userData.password
    );
    userData.password = hashedPassword;

    let responseData: any[];
    if (userData.role === "organizer") {
      responseData = await authInstance.organizerSignup(userData);
    } else {
      responseData = await authInstance.userSignup(userData, res);
    }

    return ApiResponseHandler.success(res, null, "Signup Successful", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//VERIFY-USER-IDENTITY ENDPOINT--> http://localhost:3000/

export const verifyUserIdentity = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    const requiredFields = [
      "name",
      "email",
      "ccode",
      "mobile",
      "role",
      "location",
      "proof",
    ];

    if (!isValidData(userData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }
    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", 401);
    }

    if (!Validators.isValidMobile(userData.mobile)) {
      return ApiResponseHandler.warning(res, "Enter valid mobile", 401);
    }

    if (!Validators.isValidPassword(userData.password)) {
      return ApiResponseHandler.warning(
        res,
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*())",
        401
      );
    }

    const user = req.user;
    const isUserAlready = await db
      .select("*")
      .from("users")
      .where({ _id: user!.id, role: user!.role });
    if (isUserAlready[0].status === "pending") {
      return ApiResponseHandler.error(
        res,
        "User is verified request is pending..",
        401
      );
    }
    if (isUserAlready[0].status === "active") {
      return ApiResponseHandler.error(
        res,
        "User is already verified user",
        401
      );
    }

    const isEmailMobileExists = await db
      .select("*")
      .from("users")
      .whereNot({ _id: user!.id });
    if (isEmailMobileExists.length > 0) {
      return ApiResponseHandler.warning(
        res,
        "Email or Mobile already in use",
        401
      );
    }

    const results = await db("users").where({ _id: user!.id }).update({
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      c_code: userData.ccode,
      role: userData.role,
      password: userData.password,
      location: userData.location,
      proof: userData.proof,
    });

    return ApiResponseHandler.success(
      res,
      null,
      "User verified request success..",
      200
    );
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};
//CHANGE-PASSWORD ENDPOINT--> http://localhost:3000/

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
const user=req.user;
    const requiredFields = [
      "currrentPassword",
      "newPassword",
      "confirmPassword"
    ];

    if (!isValidData(userData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }
    if (userData.newPassword !== userData.confirmPassword) {
      return ApiResponseHandler.warning(res, "New password and confirm password does not match", 400);
    }

    const isUser = await db
      .select("*")
      .from("users")
      .where({ _id: user!.id, role: user!.role });

    const isPasswordCorrect = await PasswordEncryption.comparePassword(
      userData.password,
      isUser[0].password
    );

    if (!isPasswordCorrect) {
      return ApiResponseHandler.warning(
        res,
        "current password wrong",
        401
      );
    }
    const hashedPassword = await PasswordEncryption.hashPassword(
      userData.newPassword
    );

    const results = await db("users").where({ _id: user!.id }).update({
      password: hashedPassword,
     
    });

    return ApiResponseHandler.success(
      res,
      null,
      "User password changed",
      200
    );




  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//UPDATE-PROFILE-PHOTO ENDPOINT--> http://localhost:3000/

export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//UPDATE-USER-DETAILS ENDPOINT--> http://localhost:3000/

export const updateUserDetails = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->GET-INTERNAL-TEAMS--> http://localhost:3000/

//ADMIN-->ADD-INTERNAL-TEAM--> http://localhost:3000/

//ADMIN-->UPDATE-INTERNAL-TEAM--> http://localhost:3000/

//ADMIN-->DELETE-INTERNAL-TEAM--> http://localhost:3000/

//ADMIN-->GET-ALL-USERS--> http://localhost:3000/

//ADMIN-->GET-SINGLE-USER--> http://localhost:3000/

//ADMIN-->APPROVE-USER--> http://localhost:3000/

//ADMIN-->REJECT-USER--> http://localhost:3000/

//ADMIN-->DELETE-USER--> http://localhost:3000/

//ADMIN-->GET-ALL-ORGANIZERS--> http://localhost:3000/

//ADMIN-->APPROVE-ORGANIZER--> http://localhost:3000/

//ADMIN-->REJECT-ORGANIZER--> http://localhost:3000/

//ADMIN-->DELETE-ORGANIZER--> http://localhost:3000/
