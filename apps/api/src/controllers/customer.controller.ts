import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import customerService from "../services/customer.service";

class CustomerController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const result = await customerService.list({
        search: search as string,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      ApiResponse({
        res,
        statusCode: 200,
        message: "Customer list",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.create(req.body);
      ApiResponse({
        res,
        statusCode: 201,
        message: "Customer created",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.update(req.params.id, req.body);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Customer updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async merge(req: Request, res: Response, next: NextFunction) {
    try {
      const { primaryCustomerId, duplicateCustomerId } = req.body;
      const result = await customerService.merge(
        primaryCustomerId,
        duplicateCustomerId
      );
      ApiResponse({
        res,
        statusCode: 200,
        message: "Customer merged",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async downloadReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await customerService.downloadReport(id);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=customer-report.xlsx`
      );
      res.end(file);
    } catch (err) {
      next(err);
    }
  }
}

export default new CustomerController();
