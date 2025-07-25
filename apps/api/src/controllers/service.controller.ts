import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import serviceService from "../services/service.service";

class ServiceController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const result = await serviceService.list(page, pageSize);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Service list",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await serviceService.create(req.body);
      ApiResponse({
        res,
        statusCode: 201,
        message: "Service created",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async updateDeviceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await serviceService.updateDeviceStatus(
        Number(id),
        status
      );
      ApiResponse({
        res,
        statusCode: 200,
        message: "Device status updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ServiceController();
