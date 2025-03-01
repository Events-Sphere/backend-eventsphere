import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
export class ApiResponseHandler {
    static success(res: Response, data: any, message: string, statusCode: number = 200): void {
      const response: ApiResponse = {
        success: true,
        data,
        message,
      };
      res.status(statusCode).send(response);
    }
  
    static error(res: Response, message: string, statusCode: number = 500): void {
      const response: ApiResponse = {
        success: false,
        message,
      };
      res.status(statusCode).send(response);
    }
  
    static warning(res: Response, message: string, data: any = null, statusCode: number = 300): void {
      const response: ApiResponse = {
        success: false,
        message,
        data,
      };
      res.status(statusCode).send(response);
    }
  
    static notFound(res: Response, message: string, statusCode: number = 404): void {
      const response: ApiResponse = {
        success: false,
        message,
      };
      res.status(statusCode).send(response);
    }
  }
  