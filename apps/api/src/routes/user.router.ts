import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import { validateUserCreate } from "../middlewares/user.middleware";
import UserController from "../controllers/user.controller";

export const userRouter = () => {
  const router = Router();
  // Hanya OWNER yang bisa akses
  router.get("/", requireRole(["OWNER"]), UserController.list);
  router.get("/deleted", requireRole(["OWNER"]), UserController.listDeleted);
  router.post(
    "/",
    requireRole(["OWNER"]),
    validateUserCreate,
    UserController.create
  );
  router.delete("/:id", requireRole(["OWNER"]), UserController.remove);
  router.patch("/:id/restore", requireRole(["OWNER"]), UserController.restore);
  router.delete("/:id/hard", requireRole(["OWNER"]), UserController.hardDelete);
  return router;
};
