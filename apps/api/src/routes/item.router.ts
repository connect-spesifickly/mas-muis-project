import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import ItemController from "../controllers/item.controller";

export const itemRouter = () => {
  const router = Router();
  router.get("/", requireRole(["OWNER", "ACCOUNTANT"]), ItemController.list);
  router.post(
    "/adjustments",
    requireRole(["OWNER", "ACCOUNTANT"]),
    ItemController.adjust
  );
  return router;
};
