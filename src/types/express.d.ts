interface Iuser {
  id: number;
  role: string;
}
import { Request } from "express";
declare global {
  namespace Express {
    interface Request {
      user?: Iuser;
    }
  }
}
