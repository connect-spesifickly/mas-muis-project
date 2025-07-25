import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import itemService from "../services/item.service";
import { UserRequest } from "../interfaces/middleware.interface";

class ItemController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      const result = await itemService.list(type as string);
      ApiResponse({ res, statusCode: 200, message: "Item list", data: result });
    } catch (err) {
      next(err);
    }
  }
  async adjust(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as UserRequest).user?.id;
      const result = await itemService.adjust(req.body, userId);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Item adjusted",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ItemController();
