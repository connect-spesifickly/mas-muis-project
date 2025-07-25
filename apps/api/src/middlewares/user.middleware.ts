import { Request, Response, NextFunction } from "express";
import { userCreateSchema } from "../validations/user.validation";

export const validateUserCreate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = userCreateSchema();
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    next(err);
  }
};
