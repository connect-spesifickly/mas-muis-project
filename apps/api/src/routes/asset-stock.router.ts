import { Router } from "express";
import { requireRole } from "../middlewares/auth.middleware";
import AssetStockController from "../controllers/asset-stock.controller";

export const assetStockRouter = () => {
  const router = Router();

  // Asset routes
  router.get(
    "/assets",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.getAssets
  );
  router.post(
    "/assets",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.createAsset
  );
  router.put(
    "/assets/:id",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.updateAsset
  );
  router.delete(
    "/assets/:id",
    requireRole(["OWNER"]),
    AssetStockController.deleteAsset
  );

  // Stock routes
  router.get(
    "/stocks",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.getStocks
  );
  router.post(
    "/stocks",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.createStock
  );
  router.put(
    "/stocks/:id",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.updateStock
  );
  router.delete(
    "/stocks/:id",
    requireRole(["OWNER"]),
    AssetStockController.deleteStock
  );

  // Adjustment routes
  router.post(
    "/adjustments",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.createAdjustment
  );

  // History routes
  router.get(
    "/adjustments/history",
    requireRole(["OWNER", "ACCOUNTANT"]),
    AssetStockController.getAdjustmentHistory
  );

  return router;
};
