import { Request, Response, NextFunction } from "express";
import {
  userLoginSchema,
  userRegisterSchema,
} from "../validations/user-login.validation";
import { UserRequest, UserToken } from "../interfaces/middleware.interface";
import { JWT_ACCESS_SECRET } from "../config";
import { ResponseError } from "../helpers/error";
import jwt from "jsonwebtoken";

const validateUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = userLoginSchema();
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(error);
  }
};

const validateUserRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = userRegisterSchema();
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(error);
  }
};

export function verifyUser(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;
    const token = String(authorization || "").split("Bearer ")[1];
    if (!token) throw new ResponseError(401, "Unauthenticated.");

    const verifiedUser = jwt.verify(token, JWT_ACCESS_SECRET) as UserToken;
    if (!verifiedUser || verifiedUser.role !== "Owner")
      throw new ResponseError(403, "Unauthorized.");

    req.user = verifiedUser as UserToken;

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware otorisasi berbasis role.
 * Penggunaan: requireRole(['OWNER', 'TECHNICIAN'])
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization } = req.headers;
      const token = String(authorization || "").split("Bearer ")[1];
      if (!token) throw new ResponseError(401, "Unauthenticated.");
      const verifiedUser = jwt.verify(token, JWT_ACCESS_SECRET) as UserToken;
      if (!verifiedUser || !roles.includes(verifiedUser.role)) {
        throw new ResponseError(403, "Unauthorized.");
      }
      (req as UserRequest).user = verifiedUser as UserToken;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export { validateUserLogin, validateUserRegister };
