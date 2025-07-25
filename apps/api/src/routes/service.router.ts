import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import ServiceController from "../controllers/service.controller";

export const serviceRouter = () => {
  const router = Router();
  router.get("/", requireRole(["OWNER", "TECHNICIAN"]), ServiceController.list);
  router.post(
    "/",
    requireRole(["OWNER", "TECHNICIAN"]),
    ServiceController.create
  );
  router.patch(
    "/devices/:id/status",
    requireRole(["OWNER", "TECHNICIAN"]),
    ServiceController.updateDeviceStatus
  );
  return router;
};
