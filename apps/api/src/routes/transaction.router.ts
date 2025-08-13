import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import TransactionController from "../controllers/transaction.controller";

export const transactionRouter = () => {
  const router = Router();
  router.get(
    "/",
    requireRole(["OWNER", "ACCOUNTANT"]),
    TransactionController.list
  );
  router.post(
    "/",
    requireRole(["OWNER", "ACCOUNTANT"]),
    TransactionController.create
  );
  router.put(
    "/:id",
    requireRole(["OWNER", "ACCOUNTANT"]),
    TransactionController.update
  );
  router.delete(
    "/:id",
    requireRole(["OWNER"]),
    TransactionController.delete
  );
  return router;
};
