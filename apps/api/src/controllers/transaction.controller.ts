import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import transactionService from "../services/transaction.service";
import { UserRequest } from "../interfaces/middleware.interface";

class TransactionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, sortBy } = req.query;
      const userRole = (req as UserRequest).user?.role;
      const result = await transactionService.list({
        month: Number(month),
        year: Number(year),
        sortBy: sortBy as string,
        userRole,
      });
      ApiResponse({
        res,
        statusCode: 200,
        message: "Transaction list",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as UserRequest).user?.id;
      const result = await transactionService.create(req.body, userId);
      ApiResponse({
        res,
        statusCode: 201,
        message: "Transaction created",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as UserRequest).user?.id;
      const result = await transactionService.update(id, req.body, userId);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Transaction updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as UserRequest).user?.id;
      await transactionService.delete(id, userId);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Transaction deleted",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new TransactionController();
