import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../Middleware/errorMiddleware";
import CustomError from "../Utililes/customError";
import Razorpay from "razorpay";
import crypto from "crypto";

class PaymentModel {

    razorPay = new Razorpay(
        {
            key_secret: process.env.RAZOR_PAY_SECRET_KEY,
            key_id: process.env.RAZOR_PAY_KEY_ID
        }
    );

    private readonly secret = process.env.RAZOR_PAY_SECRET_KEY!;
    createOrder = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
console.log("-----")
console.log({
    key_secret: process.env.RAZOR_PAY_SECRET_KEY,
    key_id: process.env.RAZOR_PAY_KEY_ID
})
        const { amount, currency = "INR" } = req.body;
        if (!amount) return next(new CustomError("Amount is missing", 401))
        const receipt = "receipt" + Math.random() + Date.now();
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: receipt,
            payment_capture: 1
        }
        console.log("-----")

        const order = await this.razorPay.orders.create(options);
        console.log("-----")
        console.log(order);

        res.status(200).json({
            success: true,
            data: order,
            message: "Order detail"
        })
    })

    verifyPayment = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

        const { orderId, paymentId, signatureId } = req.body;

        if (!orderId || !paymentId || !signatureId) return next(new CustomError("Enter missing datas", 401))

        const generatedSignatureId = crypto.createHmac("sha256", this.secret).update(orderId + "|" + paymentId).digest("hex");
        console.log(generatedSignatureId)
        if (generatedSignatureId !== signatureId) return next(new CustomError("Invalid signature",401))

        res.status(200).json({
            success: true,
            data: null,
            message: "Payment verified"
        })
    })
}
export default PaymentModel;