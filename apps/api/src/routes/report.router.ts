import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import ReportController from "../controllers/report.controller";

export const reportRouter = () => {
  const router = Router();
  router.get(
    "/monthly-summary",
    requireRole(["OWNER"]),
    ReportController.monthlySummary
  );
  router.get(
    "/cash-position",
    requireRole(["OWNER"]),
    ReportController.cashPosition
  );
  router.get(
    "/company-valuation",
    requireRole(["OWNER"]),
    ReportController.companyValuation
  );
  router.get(
    "/yearly-graph-data",
    requireRole(["OWNER"]),
    ReportController.yearlyGraphData
  );
  router.get(
    "/monthly-omset",
    requireRole(["OWNER"]),
    ReportController.monthlyOmset
  );
  return router;
};
