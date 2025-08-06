import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import reportService from "../services/report.service";

class ReportController {
  async monthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;

      // Validate input parameters
      if (!month || !year) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Month and year parameters are required",
          data: null,
        });
      }

      const monthNum = Number(month);
      const yearNum = Number(year);

      if (isNaN(monthNum) || isNaN(yearNum)) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Invalid month or year parameter",
          data: null,
        });
      }

      if (monthNum < 1 || monthNum > 12) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Month must be between 1 and 12",
          data: null,
        });
      }

      const result = await reportService.monthlySummary(monthNum, yearNum);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Monthly summary retrieved successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error in monthlySummary controller:", err);
      next(err);
    }
  }

  async cashPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;

      // Validate input parameters
      if (!month || !year) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Month and year parameters are required",
          data: null,
        });
      }

      const monthNum = Number(month);
      const yearNum = Number(year);

      if (isNaN(monthNum) || isNaN(yearNum)) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Invalid month or year parameter",
          data: null,
        });
      }

      if (monthNum < 1 || monthNum > 12) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Month must be between 1 and 12",
          data: null,
        });
      }

      const result = await reportService.cashPosition(monthNum, yearNum);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Cash position retrieved successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error in cashPosition controller:", err);
      next(err);
    }
  }

  async companyValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query;

      // Validate input parameters
      if (!year) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Year parameter is required",
          data: null,
        });
      }

      const yearNum = Number(year);

      if (isNaN(yearNum)) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Invalid year parameter",
          data: null,
        });
      }

      const result = await reportService.companyValuation(yearNum);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Company valuation retrieved successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error in companyValuation controller:", err);
      next(err);
    }
  }

  async yearlyGraphData(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reportService.yearlyGraphData();
      ApiResponse({
        res,
        statusCode: 200,
        message: "Yearly graph data retrieved successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error in yearlyGraphData controller:", err);
      next(err);
    }
  }

  async monthlyOmset(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query;

      // Validate input parameters
      if (!year) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Year parameter is required",
          data: null,
        });
      }

      const yearNum = Number(year);

      if (isNaN(yearNum)) {
        return ApiResponse({
          res,
          statusCode: 400,
          message: "Invalid year parameter",
          data: null,
        });
      }

      const result = await reportService.getMonthlyOmsetPerYear(yearNum);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Monthly omset data retrieved successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error in monthlyOmset controller:", err);
      next(err);
    }
  }
}

export default new ReportController();
