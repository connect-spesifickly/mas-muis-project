import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import userService from "../services/user.service";
import { Role } from "@prisma/client";

class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.list();
      ApiResponse({ res, statusCode: 200, message: "User list", data: users });
    } catch (err) {
      next(err);
    }
  }
  async listDeleted(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.listDeleted();
      ApiResponse({
        res,
        statusCode: 200,
        message: "Deleted user list",
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;
      const user = await userService.create({
        email,
        password,
        name,
        role: Role[role as keyof typeof Role],
      });
      ApiResponse({
        res,
        statusCode: 201,
        message: "User created",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.remove(req.params.id);
      ApiResponse({
        res,
        statusCode: 200,
        message: "User deleted",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.restore(req.params.id);
      ApiResponse({
        res,
        statusCode: 200,
        message: "User restored",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
  async hardDelete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.hardDelete(req.params.id);
      ApiResponse({
        res,
        statusCode: 200,
        message: "User permanently deleted",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
