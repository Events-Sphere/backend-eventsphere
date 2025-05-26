import catchAsyncError from "../Middleware/errorMiddleware"
import { Request, Response, NextFunction } from "express"
import CustomError from "../Utililes/customError";
import ApprovalClass from "../classes/approvalClass";
import EventClass from "../classes/eventClass";

const approval = new ApprovalClass();
const event = new EventClass();
class ApprovalModel {

  approveUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return next(new CustomError("Approver ID is missing", 400))
    }
    const orgId = req.body.id;
    if (!orgId) {
      return next(new CustomError("User ID is missing", 400))
    }
    const org: any = await approval.approveUserById(
      orgId,
      approvedBy
    );
    if (org <= 0) {
      return next(new CustomError("User not found with this ID", 404))
    }
    return res.status(200).json({
      success: true,
      data: org,
      message: "User approved"
    })


  })
  rejectUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return next(new CustomError("Rejecter ID is missing", 400))
    }
    const userId = req.body.id;
    if (!userId) {
      return next(new CustomError("User ID is missing", 400))
    }
    const denialReason = req.body.reason;
    if (!denialReason) return next(new CustomError("Rejection reason is missing", 401))
    const user: any = await approval.rejectUserById(
      userId,
      approvedBy,
      denialReason

    );
    if (user <= 0) {
      return next(new CustomError("User not found with this ID", 404))
    }
    return res.status(200).json({
      success: true,
      data: user,
      message: "User rejected"
    })
  })

  approveOrganizer = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return next(new CustomError("Approver ID is missing", 400))
    }
    const orgId = req.body.id;
    if (!orgId) {
      return next(new CustomError("User ID is missing", 400))
    }
    const org: any = await approval.approveUserById(
      orgId,
      approvedBy
    );
    if (org <= 0) {
      return next(new CustomError("Organizer not found with this ID", 404))
    }
    return res.status(200).json({
      success: true,
      data: org,
      message: "Organizer approved"
    })

  })
  rejectOrganizer = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const approvedBy = req.user!.id;
    if (!approvedBy) {
      return next(new CustomError("Approver id missing", 400))
    }
    const orgId = req.body.id;
    if (!orgId) {
      return next(new CustomError("User id missing", 400))
    }
    const denialReason = req.body.reason;
    if (!denialReason) return next(new CustomError("Reason for reject is missing", 401))

    const user: any = await approval.rejectUserById(
      orgId,
      approvedBy,
      denialReason

    );
    if (user <= 0) {
      return next(new CustomError("Organizer not found", 404))
    }
    return res.status(200).json({
      success: true,
      data: user,
      message: "Organizer rejected"
    })

  })

  approveOrRejectEvent = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const approvedBy = req.user!.id;
    if (!approvedBy) return next(new CustomError("Approver ID is missing", 401))
    const { data } = req.body;
    if (!data) {
      return next(new CustomError("Data is missing", 400))
    }
    const eventId = Number(data.eventId);
    const eventResponse = await event.getEventById(eventId);
    if (!eventResponse) {
      return next(new CustomError("Event not found with this ID", 404))
    }
    const requestApproveEventIds: number[] = data.approveEventIds || [];
    const requestRejectEventIds: number[] = Object.keys(
      data.rejectEvents || {}
    ).map(Number);
    const requestRejectEventReasons: string[] = Object.values(
      data.rejectEvents || {}
    ).map(String);
    const totalIds =
      requestApproveEventIds.length + requestRejectEventIds.length;
    const orgId = eventResponse.org_id;
    if (JSON.parse(eventResponse.sub_event_items).length != totalIds) {
      return next(new CustomError("ID is  missing matching", 400))
    }
    const response = await approval.approveOrRejectEvent({
      eventId,
      approveIds: requestApproveEventIds,
      rejectIds: requestRejectEventIds,
      reasons: requestRejectEventReasons,
      orgId: orgId,
      approvedBy: approvedBy
    });
    return res.status(200).json({
      success: true,
      data: null,
      message: "Event approved or rejected"
    });
  })
}
export default ApprovalModel;