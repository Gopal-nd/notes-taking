import "express";
import type { JwtPayload } from "jsonwebtoken";
interface User {
  id: string;
  email: string;
}
declare module "express-serve-static-core" {
  interface Request {
    user?: User | JwtPayload;
  }
}
