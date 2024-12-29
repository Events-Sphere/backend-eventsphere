import { AuthClass } from "./authClass";
import { Request, Response } from "express";
import { UserLoginInterface } from "../../Interfaces/userInterface";
import { ApiResponseHandler } from "../../Middleware/Api-response-handler";


const authInstance = new AuthClass();

const validUserData = (data: any): data is UserLoginInterface => {
  return typeof data.email === "string" && typeof data.password === "string";
};



export const login = async (req:Request , res:Response) => {
  try {
    const data = req.body;

    if (!validUserData(data)) {
      return ApiResponseHandler.warning(res, "All fields are required", 401);
    }

    const userData: UserLoginInterface = {
      email: data.email,
      password: data.password,
    };

    try {
      const responseData: any[] = await authInstance.userLogin(userData);

      if (responseData.length > 0) {
        return ApiResponseHandler.success(res, null, "Login Successful", 200);
      } else {
        return ApiResponseHandler.warning( res, "No user found with provided credentials", 401);
      }
    } catch (error) {
      return ApiResponseHandler.warning(res, "Invalid login credentials", 401);
    }
  } catch (e) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};


export const signup = async (req:Request , res:Response) => {
  try {
    const data = req.body;

    try {
      
    } catch (error) {
      return ApiResponseHandler.warning(res, "Invalid credentials", 401);
    }
  } catch (e) {
    return ApiResponseHandler.error(res, "Internal server error", 501);
  }
};

// write rest of the code here
