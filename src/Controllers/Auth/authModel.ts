import { AuthClass } from "./authClass";
import { NextFunction, Request, Response } from "express";
import { ApiResponseHandler } from "../../Middleware/apiResponseMiddleware";
import { Validators } from "../../Utililes/validators";
import { PasswordEncryption } from "../../Utililes/passwordEncryption";
import db from "../../Config/knex";
import { FirebaseStorage } from "../../Services/Storage";
import { Jwt } from "../../Utililes/jwt";
import jwt from "jsonwebtoken";

const authInstance = new AuthClass();
const isValidData = (data: any, fields: string[]): boolean => {
  return fields.every(
    (field) => typeof data[field] === "string" && data[field].trim() !== ""
  );
};

interface ParsedFiles {
  noc: any | null;
  proof: any[];
}

interface FileStorageResponse {
  status: boolean;
  message?: string;
  url?: any;
  urls?: any;
}

//LOGIN ENDPOINT--> http://localhost:3000/auth/login

export const login = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    if (!isValidData(userData, ["email", "password"])) {
      return ApiResponseHandler.warning(res, "All fields are required", null, 401);
    }

    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", null, 401);
    }

    const isUserExists: any = await authInstance.userLogin(userData);
    if (isUserExists.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    if (isUserExists.data.length <= 0) {
      return ApiResponseHandler.warning(
        res,
        "No user found with provided credentials",
        null, 401
      );
    }

    const isPasswordCorrect = await PasswordEncryption.comparePassword(
      userData.password,
      isUserExists.data[0].password
    );

    if (!isPasswordCorrect) {
      return ApiResponseHandler.warning(
        res,
        "Password does not match with your credentials", null,
        401
      );
    }

    const token: any = await Jwt.generateToken({
      id: isUserExists.data[0]._id,
      role: isUserExists.data[0].role,
    });
    if (token.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    const accessToken = {
      accessToken: token.data
    }
    return ApiResponseHandler.success(res, accessToken, "Login Successful", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    if (!isValidData(userData, ["email", "password"])) {
      return ApiResponseHandler.warning(res, "All fields are required", null, 401);
    }

    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", null, 401);
    }

    const isUserExists: any = await authInstance.adminLogin(userData);
    if (isUserExists.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    if (isUserExists.data.length <= 0) {
      return ApiResponseHandler.warning(
        res,
        "No user found with provided credentials",
        null, 401
      );
    }

    const isPasswordCorrect = await PasswordEncryption.comparePassword(
      userData.password,
      isUserExists.data[0].password
    );

    if (!isPasswordCorrect) {
      return ApiResponseHandler.warning(
        res,
        "Password does not match with your credentials", null,
        401
      );
    }

    const token: any = await Jwt.generateToken({
      id: isUserExists.data[0]._id,
      role: isUserExists.data[0].role,
    });
    if (token.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    const accessToken = {
      accessToken: token.data
    }
    return ApiResponseHandler.success(res, accessToken, "Login Successful", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};
//SIGNUP ENDPOINT--> http://localhost:3000/auth/signup
//               --> http://localhost:3000/auth/organizer/signup

export const signup = async (req: Request, res: Response) => {
  try {
    let userData;
    if (req.body.data) {
      userData = JSON.parse(req.body.data);
    } else {
      userData = req.body;
    }
    //rollback implement
    //latitude and longitude range should check==>pending
    //college code range check and duplicate check

    console.log("userData:");
Object.entries(userData).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});


    if (!userData.role) {
      return ApiResponseHandler.warning(res, "user role is required", null, 401);
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
          "longitude",
          "latitude",
          "collegeName",
          "collegeCode",
        ];
    if (userData.role === "organizer" && !req.files) {
      return ApiResponseHandler.warning(res, "all image files required ", null, 401);
    }

    if (!isValidData(userData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are requireds", null, 401);
    }

    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", null, 401);
    }

    if (!Validators.isValidMobile(userData.mobile)) {
      return ApiResponseHandler.warning(res, "Enter valid mobile", null, 401);
    }

    if (!Validators.isValidPassword(userData.password)) {
      return ApiResponseHandler.warning(
        res,
        "Password must be includes (uppercase, symbols, and numbers)",
        null, 401
      );
    }

    const isUserExists: any = await authInstance.isUserExistsOnMobileOrEmail(
      userData.email,
      userData.mobile
    );
    if (!isUserExists.status) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }
    console.log(isUserExists.data?.length)
    if (isUserExists.data?.length > 0) {
      return ApiResponseHandler.warning(
        res,
        "Email or Mobile already in use",
        null, 401
      );
    }

    const hashedPassword = await PasswordEncryption.hashPassword(
      userData.password
    );
    userData.password = hashedPassword;

    let responseData: any;
    if (userData.role === "organizer") {
      const isOrganiztionCodeExists: any = await authInstance.isOrganizationCodeExists(
        userData.collegeCode
      );
      if (!isOrganiztionCodeExists.status) {
        return ApiResponseHandler.error(
          res,
          "Something went wrong. Try again!",
          500
        );
      }
      console.log(isOrganiztionCodeExists.data.length)
      if (isOrganiztionCodeExists.data.length > 0) {
        return ApiResponseHandler.warning(
          res,
          "Organization code already in use",
          null, 401
        );
      }
      const imageList: ParsedFiles = {
        proof: [],
        noc: null,
      };

      if (Array.isArray(req.files)) {
        (req.files as Express.Multer.File[]).forEach((file) => {
          if (file.fieldname === "noc") {
            imageList.noc = file;
          } else if (file.fieldname === "proof") {
            imageList.proof.push(file);
          }
        });
      } else {
        return ApiResponseHandler.error(res, "Image files not found", 400);
      }

      if (imageList.noc == null || imageList.proof.length <= 0) {
        return ApiResponseHandler.error(res, "noc or proof missing", 400);
      }

      const nocPdfUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadSingleImage(`DOCUMENTS/NOC`, imageList.noc);
      if (nocPdfUploadedResponse.status === false) {
        return ApiResponseHandler.error(
          res,
          nocPdfUploadedResponse.message ?? "failed to upload NOC . try again!",
          500
        );
      }
      const proofImgUploadedResponse: FileStorageResponse =
        await FirebaseStorage.uploadCoverImages(`USERS/PROOF`, imageList.proof);
      if (proofImgUploadedResponse.status === false) {
        return ApiResponseHandler.error(
          res,
          "failed to upload proof images. try again later",
          500
        );
      }

      console.log(nocPdfUploadedResponse);

      userData.proof = JSON.stringify(proofImgUploadedResponse.urls);
      userData.collegeNoc = nocPdfUploadedResponse.url;
      console.log(userData);

      responseData = await authInstance.organizerSignup(userData);
      if (!responseData.status) {
        return ApiResponseHandler.error(
          res,
          "Something went wrong. Try again!",
          500
        );
      }
    } else {

      responseData = await authInstance.userSignup(userData);

      if (responseData.status === false) {
        return ApiResponseHandler.error(
          res,
          "Something went wrong. Try again!",
          500
        );
      }
    }
    console.log(responseData)
    console.log(responseData.data)

    console.log("NEW DATA:" +
      responseData.data[0] +
      userData.role,
    );
    const token: any = await Jwt.generateToken({
      id: responseData.data[0],
      role: userData.role,
    });
    if (token.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }
    const accessToken = {
      accessToken: token.data
    }

    return ApiResponseHandler.success(res, accessToken, "Signup Successful", 200);
  } catch (error) {
    console.log(error);
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};



export const organizerSignup = async (req: Request, res: Response) => {
  try {
    const userData = req.body.data ? JSON.parse(req.body.data) : req.body;

    const requiredFields = [
      "name", "email", "ccode", "mobile", "role", "password",
      "location", "longitude", "latitude", "collegeName", "collegeCode"
    ];

    if (!req.files || !(req.files as Express.Multer.File[]).length) {
      return ApiResponseHandler.warning(res, "All image files required", null, 400);
    }

    if (!isValidData(userData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are required", null, 400);
    }

    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", null, 400);
    }

    if (!Validators.isValidMobile(userData.mobile)) {
      return ApiResponseHandler.warning(res, "Enter valid mobile", null, 400);
    }

    if (!Validators.isValidPassword(userData.password)) {
      return ApiResponseHandler.warning(res, "Password must include uppercase, symbol, and number", null, 400);
    }

    const isUserExists = await authInstance.isUserExistsOnMobileOrEmail(userData.email, userData.mobile);
    if (!isUserExists.status || isUserExists.data?.length > 0) {
      return ApiResponseHandler.warning(res, "Email or Mobile already in use", null, 409);
    }

    const isOrgCodeExists = await authInstance.isOrganizationCodeExists(userData.collegeCode);
    if (!isOrgCodeExists.status || isOrgCodeExists.data?.length > 0) {
      return ApiResponseHandler.warning(res, "Organization code already in use", null, 409);
    }

    const files = req.files as Express.Multer.File[];
    const imageList: ParsedFiles = { proof: [], noc: null };

    for (const file of files) {
      if (file.fieldname === "noc") imageList.noc = file;
      else if (file.fieldname === "proof") imageList.proof.push(file);
    }

    if (!imageList.noc || imageList.proof.length === 0) {
      return ApiResponseHandler.error(res, "noc or proof missing", 400);
    }

    const nocResponse = await FirebaseStorage.uploadSingleImage("DOCUMENTS/NOC", imageList.noc);
    if (!nocResponse.status) {
      return ApiResponseHandler.error(res, nocResponse.message || "Failed to upload NOC", 500);
    }

    const proofResponse = await FirebaseStorage.uploadCoverImages("USERS/PROOF", imageList.proof);
    if (!proofResponse.status) {
      return ApiResponseHandler.error(res, "Failed to upload proof images", 500);
    }

    userData.password = await PasswordEncryption.hashPassword(userData.password);
    userData.proof = JSON.stringify(proofResponse.urls);
    userData.collegeNoc = nocResponse.url;

    const responseData = await authInstance.organizerSignup(userData);
    if (!responseData.status) {
      return ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
    }

    const token = await Jwt.generateToken({ id: responseData.data[0], role: userData.role });
    if (!token.status) {
      return ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
    }

    return ApiResponseHandler.success(res, { accessToken: token.data }, "Signup Successful", 200);
  } catch (error) {
    console.error(error);
    return ApiResponseHandler.error(res, "Internal server error", 500);
  }
};


export const validateSession = async(req:Request, res:Response): Promise<any> => {
  try {
    const authHeader: any = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY || "12345qwer");
    return res.status(200).send({
      success: true,
      data: token,
      message: "Valid session"
    });
  } catch (err) {
    return res.status(401).send({ success: false, message: "Invalid or expired token" });
  }
};

//VERIFY-USER-IDENTITY ENDPOINT--> http://localhost:3000/

export const verifyUserIdentity = async (req: Request, res: Response) => {
  try {
    const userData = JSON.parse(req.body.data);
    const user = req.user;
    if (!user) {
      return ApiResponseHandler.warning(res, "Something went wrong", 500);
    }

    const requiredFields = [
      "name",
      "email",
      "ccode",
      "mobile",
      "role",
      "location",
    ];

    if (!isValidData(userData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are required", null, 401);
    }
    if (!Validators.isValidEmail(userData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", 401);
    }

    if (!Validators.isValidMobile(userData.mobile)) {
      return ApiResponseHandler.warning(res, "Enter valid mobile", 401);
    }

    const isUserVerified = await authInstance.isVerifiedUser(user!.id);
    if (isUserVerified.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    if (isUserVerified.data[0].status === "pending") {
      return ApiResponseHandler.error(
        res,
        "User is verified request is pending..",
        401
      );
    }

    if (isUserVerified.data[0].status === "active") {
      return ApiResponseHandler.error(
        res,
        "User is already verified user",
        401
      );
    }
    console.log(user!.id,)

    const isEmailMobileExists =
      await authInstance.isUserExistsOnMobileOrEmailWithoutSpecificId(
        user!.id,
        userData.email,
        userData.mobile
      );
    console.log(isEmailMobileExists.data)

    if (isEmailMobileExists.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }
    if (isEmailMobileExists.data.length > 0) {
      return ApiResponseHandler.warning(
        res,
        "Email or Mobile already in use",
        401
      );
    }
    ////////////////////////////////////////////////////////////////////////
    const imageList: any = {
      proof: [],
      profile: null,
    };

    if (Array.isArray(req.files)) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        if (file.fieldname === "noc") {
          imageList.noc = file;
        } else
          if (file.fieldname === "proof") {
            imageList.proof.push(file);
          }
      });
    } else {
      return ApiResponseHandler.error(res, "Image files not found", 400);
    }

    // if (imageList.noc == null || imageList.proof.length <= 0) {
    //   return ApiResponseHandler.error(res, "noc or proof missing", 400);
    // }

    // const nocPdfUploadedResponse: FileStorageResponse =
    //   await FirebaseStorage.uploadSingleImage(`DOCUMENTS/NOC`, imageList.noc);
    // if (nocPdfUploadedResponse.status === false) {
    //   return ApiResponseHandler.error(
    //     res,
    //     nocPdfUploadedResponse.message ?? "failed to upload NOC . try again!",
    //     500
    //   );
    // }
    // const proofImgUploadedResponse: FileStorageResponse =
    //   await FirebaseStorage.uploadCoverImages(`USERS/PROOF`, imageList.proof);
    // if (proofImgUploadedResponse.status === false) {
    //   return ApiResponseHandler.error(
    //     res,
    //     "failed to upload proof images. try again later",
    //     500
    //   );
    // }

    // console.log(nocPdfUploadedResponse);

    // userData.proof = JSON.stringify(proofImgUploadedResponse.urls);
    // userData.collegeNoc = nocPdfUploadedResponse.url;
    // console.log(userData);

    ///////////////////////////////////////////////////////////////////////



    if (Array.isArray(req.files)) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        if (file.fieldname === "proof") {
          imageList.proof.push(file);
        }
        else if (file.fieldname === "profile") {
          imageList.profile = file;
        }
      });
    } else {
      return ApiResponseHandler.error(res, "Image files not found", 400);
    }

    if (imageList.proof.length <= 0) {
      return ApiResponseHandler.error(res, " proof missing", 400);
    }
    if (imageList.profile == null || imageList.proof.length <= 0) {
      return ApiResponseHandler.error(res, "noc or proof missing", 400);
    }

    const profileUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadSingleImage(`USERS/PROFILE`, imageList.profile);
    if (profileUploadedResponse.status === false) {
      return ApiResponseHandler.error(
        res,
        profileUploadedResponse.message ?? "failed to upload Profile . try again!",
        500
      );
    }

    const proofImgUploadedResponse: FileStorageResponse =
      await FirebaseStorage.uploadCoverImages(`USERS/PROOF`, imageList.proof);
    if (proofImgUploadedResponse.status === false) {
      return ApiResponseHandler.error(
        res,
        "failed to upload proof images. try again later",
        500
      );
    }

    userData.proof = JSON.stringify(proofImgUploadedResponse.urls);
    userData.profile = profileUploadedResponse.url;


    const responseData = await authInstance.updateUserIdentity(
      user!.id,
      userData
    );
    if (responseData.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }
    return ApiResponseHandler.success(
      res,
      null,
      "User verified request success..",
      200
    );
  } catch (error) {
    console.log(error);
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//------------------------

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return ApiResponseHandler.warning(res, "User id missing", 400);
    }
    if (!user?.role) {
      return ApiResponseHandler.warning(res, "User role missing", 400);
    }
    //PENDING --> Combine two tables

    const userData = await authInstance.getUserProfile(user.role, user.id);
    console.log(userData);
    if (userData.data.length <= 0) {
      return ApiResponseHandler.warning(res, "userData not found", 404);
    }

    return ApiResponseHandler.success(res, userData.data, "User", 200);
  } catch (error) {
    console.log(error);
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};


export const getUserNameAndLocation = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return ApiResponseHandler.warning(res, "User id missing", 400);
    }
    if (!user?.role) {
      return ApiResponseHandler.warning(res, "User role missing", 400);
    }
    //PENDING --> Combine two tables

    const userData = await authInstance.getUserNameAndLocation(user.role, user.id);
    console.log(userData);
    if (userData.data.length <= 0) {
      return ApiResponseHandler.warning(res, "userData not found", 404);
    }

    return ApiResponseHandler.success(res, userData.data, "User", 200);
  } catch (error) {
    console.log(error);
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

// //CHANGE-PASSWORD ENDPOINT--> http://localhost:3000/

// export const changePassword = async (req: Request, res: Response) => {
//   try {
//     const userData = req.body;
//     const user = req.user;
//     if (!user) {
//       return ApiResponseHandler.warning(res, "Something went wrong", 500);
//     }
//     const requiredFields = [
//       "currrentPassword",
//       "newPassword",
//       "confirmPassword",
//     ];
//     if (!isValidData(userData, requiredFields)) {
//       return ApiResponseHandler.warning(res, "All fields are required", 401);
//     }
//     if (userData.newPassword !== userData.confirmPassword) {
//       return ApiResponseHandler.warning(
//         res,
//         "New password and confirm password does not match",
//         400
//       );
//     }

//     const isUserExistsOnIdAndRole = await authInstance.isUserExistsOnIdAndRole(
//       user!.id,
//       user!.role
//     );

//     if (isUserExistsOnIdAndRole.status === false) {
//       return ApiResponseHandler.error(
//         res,
//         "Something went wrong. Try again!",
//         500
//       );
//     }

//     if (isUserExistsOnIdAndRole.data.length > 0) {
//       return ApiResponseHandler.warning(res, "user not found", 404);
//     }

//     const isPasswordCorrect = await PasswordEncryption.comparePassword(
//       userData.currentPassword,
//       isUserExistsOnIdAndRole.data[0].password
//     );

//     if (!isPasswordCorrect) {
//       return ApiResponseHandler.warning(res, "current password wrong", 401);
//     }

//     const hashedPassword = await PasswordEncryption.hashPassword(
//       userData.newPassword
//     );

//     const results = await db("users").where({ _id: user!.id }).update({
//       password: hashedPassword,
//     });

//     return ApiResponseHandler.success(res, null, "User password changed", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };

// //UPDATE-PROFILE-PHOTO ENDPOINT--> http://localhost:3000/

// export const updateProfilePhoto = async (req: Request, res: Response) => {
//   try {
//     const userData = req.body;
//     const user = req.user;
//     // PENDING WORK --> upload user profile and delete old profile in firebase

//     if (!user) {
//       return ApiResponseHandler.warning(res, "Something went wrong", 500);
//     }
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };

// //UPDATE-USER-DETAILS ENDPOINT--> http://localhost:3000/

// export const updateUserDetails = async (req: Request, res: Response) => {
//   try {
//     // PENDING WORK
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };

// //ADMIN-->GET-ALL-USER--> http://localhost:3000/

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await authInstance.getAllUsers("user");

    return ApiResponseHandler.success(res, users.data, "Users", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->GET-ALL-ORGANIZERS--> http://localhost:3000/

export const getAllOrganizers = async (req: Request, res: Response) => {
  try {
    const organizers = await authInstance.getAllUsers("organizer");
    //PENDING --> Combine two tables
    return ApiResponseHandler.success(res, organizers.data, "Organizers", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};


// //ADMIN-->GET-SINGLE-USER--> http://localhost:3000/

// export const getSingleUser = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     if (!id) {
//       return ApiResponseHandler.warning(res, "User id missing", 400);
//     }

//     const users = await authInstance.getSingleUser("user", id);
//     if (users.data.length > 0) {
//       return ApiResponseHandler.warning(res, "user not found", 404);
//     }

//     return ApiResponseHandler.success(res, users.data, "User", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };

//ADMIN-->DELETE-USER--> http://localhost:3000/

export const deleteSingleUser = async (req: Request, res: Response) => {
  try {
    // PENDING WORK --> delete user profile in firebase
    const id = req.body.id;
    if (!id) {
      return ApiResponseHandler.warning(res, "User id missing", 400);
    }

    const deleteUser = await authInstance.deleteUser("user", id);

    if (deleteUser.data > 0) {
      return ApiResponseHandler.success(res, null, "User deleted", 200);
    } else {
      return ApiResponseHandler.warning(res, "user not found", 404);
    }
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};



//ADMIN-->GET-SINGLE-ORGANIZERS--> http://localhost:3000/

// export const getSingleOrganizer = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     if (!id) {
//       return ApiResponseHandler.warning(res, "User id missing", 400);
//     }
//     //PENDING --> Combine two tables

//     const organizer = await authInstance.getSingleUser("organizer", id);
//     if (organizer.data.length > 0) {
//       return ApiResponseHandler.warning(res, "organizer not found", 404);
//     }

//     return ApiResponseHandler.success(res, organizer.data, "User", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };

//ADMIN-->DELETE-SINGLE-ORGANIZERS--> http://localhost:3000/

export const deleteSingleOrganizer = async (req: Request, res: Response) => {
  try {
    // PENDING WORK --> delete organizer profile in firebase
    const id = req.body.id;
    if (!id) {
      return ApiResponseHandler.warning(res, "User id missing", 400);
    }
    //PENDING --> Combine two tables

    const Organiser = await authInstance.deleteUser("organizer", id);

    if (Organiser.data > 0) {
      return ApiResponseHandler.success(res, null, "Orgnaizer deleted", 200);
    } else {
      return ApiResponseHandler.warning(res, "Orgnaizer not found", 404);
    }
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->GET-ALL-SQUARDS--> http://localhost:3000/

export const getAllSquards = async (req: Request, res: Response) => {
  try {
    const squards = await authInstance.getAllUsers("squard");

    return ApiResponseHandler.success(res, squards.data, "Squards", 200);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->GET-SINGLE-SQUARDS--> http://localhost:3000/

// export const getSingleSquards = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     if (!id) {
//       return ApiResponseHandler.warning(res, "Squard id missing", 400);
//     }

//     const squard = await authInstance.getSingleUser("squard", id);
//     if (squard.data.length > 0) {
//       return ApiResponseHandler.warning(res, "squard not found", 404);
//     }

//     return ApiResponseHandler.success(res, squard.data, "User", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };

//ADMIN-->DELETE-SINGLE-SQUARDS--> http://localhost:3000/

export const deleteSingleSquard = async (req: Request, res: Response) => {
  try {
    // PENDING WORK --> delete user profile in firebase

    const id = req.body.id;
    if (!id) {
      return ApiResponseHandler.warning(res, "Squard id missing", 400);
    }

    const squard = await authInstance.deleteUser("squard", id);

    if (squard.data > 0) {
      return ApiResponseHandler.success(res, null, "Squard deleted", 200);
    } else {
      return ApiResponseHandler.warning(res, "Squard not found", 404);
    }
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->APPROVE-ORGANIZER--> http://localhost:3000/
//ADMIN-->APPROVE-USER--> http://localhost:3000/

export const approveUser = (req: Request, res: Response) => {
  try {
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return ApiResponseHandler.warning(res, "Approver id missing", 400);
    }

    const userId = req.body.id;
    if (!userId) {
      return ApiResponseHandler.warning(res, "User id missing", 400);
    }
    const user: any = authInstance.updateUserStatus(
      "approve",
      userId,
      approvedBy
    );
    if (user > 0) {
      return ApiResponseHandler.success(res, null, "User approved", 200);
    } else {
      return ApiResponseHandler.warning(res, "User not found", 404);
    }
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->REJECT-ORGANIZER--> http://localhost:3000/
//ADMIN-->REJECT-USER--> http://localhost:3000/

export const rejectUser = (req: Request, res: Response) => {
  try {
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return ApiResponseHandler.warning(res, "Approver id missing", 400);
    }

    const userId = req.body.id;
    const denialReason = req.body.denialReason;
    if (!userId) {
      return ApiResponseHandler.warning(res, "User id missing", 400);
    }
    const user: any = authInstance.updateUserStatus(
      "reject",
      userId,
      approvedBy,
      denialReason
    );
    if (user > 0) {
      return ApiResponseHandler.success(res, null, "User rejected", 200);
    } else {
      return ApiResponseHandler.warning(res, "User not found", 404);
    }
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

//ADMIN-->ADD-INTERNAL-TEAM--> http://localhost:3000/

export const createSquard = async (req: Request, res: Response) => {
  try {
    //PENDING-->  upload profile pic in firestore
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return ApiResponseHandler.warning(res, "Approver id missing", 400);
    }

    const squardData = req.body;

    const requiredFields = [
      "name",
      "email",
      "password",
      "c_code",
      "mobile",
      "profile",
      "role",
      "location",
      "status",
    ];

    if (!isValidData(squardData, requiredFields)) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }

    if (!Validators.isValidEmail(squardData.email)) {
      return ApiResponseHandler.warning(res, "Enter valid email", 401);
    }

    if (!Validators.isValidMobile(squardData.mobile)) {
      return ApiResponseHandler.warning(res, "Enter valid mobile", 401);
    }

    if (!Validators.isValidPassword(squardData.password)) {
      return ApiResponseHandler.warning(
        res,
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*())",
        401
      );
    }

    const isSquardExists: any = await authInstance.isUserExistsOnMobileOrEmail(
      squardData.email,
      squardData.mobile
    );
    if (isSquardExists.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }
    if (isSquardExists.data.length > 0) {
      return ApiResponseHandler.warning(
        res,
        "Email or Mobile already in use",
        401
      );
    }

    const hashedPassword = await PasswordEncryption.hashPassword(
      squardData.password
    );
    squardData.password = hashedPassword;

    const squard = await authInstance.createSquard(squardData);
    if (squard.status === false) {
      return ApiResponseHandler.error(
        res,
        "Something went wrong. Try again!",
        500
      );
    }

    return ApiResponseHandler.success(res, null, "Squard created", 201);
  } catch (error) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }


};




//ADMIN-->UPDATE-INTERNAL-TEAM--> http://localhost:3000/

// export const updateSquard = async (req: Request, res: Response) => {
//   try {
//     //PENDING-->  upload profile pic in firestore
//     const approvedBy = req.user!.id;
//     if (!approvedBy) {
//       return ApiResponseHandler.warning(res, "Approver id missing", 400);
//     }

//     const squardData = req.body;

//     const requiredFields = [
//       "name",
//       "email",
//       "password",
//       "c_code",
//       "mobile",
//       "role",
//       "location",
//       "status",
//     ];

//     if (!isValidData(squardData, requiredFields)) {
//       return ApiResponseHandler.warning(res, "All fields are required", 401);
//     }

//     if (!Validators.isValidEmail(squardData.email)) {
//       return ApiResponseHandler.warning(res, "Enter valid email", 401);
//     }

//     if (!Validators.isValidMobile(squardData.mobile)) {
//       return ApiResponseHandler.warning(res, "Enter valid mobile", 401);
//     }

//     if (!Validators.isValidPassword(squardData.password)) {
//       return ApiResponseHandler.warning(
//         res,
//         "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*())",
//         401
//       );
//     }

//     const isSquardExists: any =
//       await authInstance.isUserExistsOnMobileOrEmailWithoutSpecificId(
//         squardData.userId,
//         squardData.email,
//         squardData.mobile
//       );
//     if (isSquardExists.status === false) {
//       return ApiResponseHandler.error(
//         res,
//         "Something went wrong. Try again!",
//         500
//       );
//     }
//     if (isSquardExists.data.length > 0) {
//       return ApiResponseHandler.warning(
//         res,
//         "Email or Mobile already in use",
//         401
//       );
//     }

//     const hashedPassword = await PasswordEncryption.hashPassword(
//       squardData.password
//     );
//     squardData.password = hashedPassword;

//     const squard: any = await authInstance.updateSquard(squardData);
//     if (squard.status === false) {
//       return ApiResponseHandler.error(
//         res,
//         "Something went wrong. Try again!",
//         500
//       );
//     }
//     if (squard > 0) {
//       return ApiResponseHandler.success(res, null, "Squard created", 201);
//     } else {
//       return ApiResponseHandler.warning(res, "Squard not found", 404);
//     }
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
