import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import reportService from "../services/report.service";

class ReportController {
  async monthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const result = await reportService.monthlySummary(
        Number(month),
        Number(year)
      );
      ApiResponse({
        res,
        statusCode: 200,
        message: "Monthly summary",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async cashPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const result = await reportService.cashPosition(
        Number(month),
        Number(year)
      );
      ApiResponse({
        res,
        statusCode: 200,
        message: "Cash position",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async companyValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query;
      const result = await reportService.companyValuation(Number(year));
      ApiResponse({
        res,
        statusCode: 200,
        message: "Company valuation",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async yearlyGraphData(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reportService.yearlyGraphData();
      ApiResponse({
        res,
        statusCode: 200,
        message: "Yearly graph data",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  async monthlyOmset(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query;
      const result = await reportService.getMonthlyOmsetPerYear(Number(year));
      ApiResponse({
        res,
        statusCode: 200,
        message: "Monthly omset per year",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ReportController();
