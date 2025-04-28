import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("ERROR : "+err)
    const statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (process.env.NODE_ENV == "PROD") {
        if (err.codde && err.code.startsWith("ER_")) { message = "Internal Server Error(DB)" }
        res.status(statusCode).json({
            success: false,
            data: null,
            message: message
        })
    }
    else {
        res.status(statusCode).json({
            success: false,
            data: null,
            message:message,
            stack: err
        })
    }
}

export default errorHandler;