import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import CustomerController from "../controllers/customer.controller";

export const customerRouter = () => {
  const router = Router();
  router.get(
    "/",
    requireRole(["OWNER", "TECHNICIAN"]),
    CustomerController.list
  );
  router.post(
    "/",
    requireRole(["OWNER", "TECHNICIAN"]),
    CustomerController.create
  );
  router.patch(
    "/:id",
    requireRole(["OWNER", "TECHNICIAN"]),
    CustomerController.update
  );
  router.post(
    "/merge",
    requireRole(["OWNER", "TECHNICIAN"]),
    CustomerController.merge
  );
  router.get(
    "/:id/download-report",
    requireRole(["OWNER"]),
    CustomerController.downloadReport
  );
  router.delete(
    "/:id",
    requireRole(["OWNER"]),
    CustomerController.delete
  );
  return router;
};
