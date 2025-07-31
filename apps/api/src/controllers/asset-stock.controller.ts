import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helpers/api-response";
import itemService from "../services/asset-stock.service";
import { ItemType } from "@prisma/client";

class AssetStockController {
  async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await itemService.getItems(ItemType.ASSET);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Assets retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await itemService.getItems(ItemType.STOCK);
      ApiResponse({
        res,
        statusCode: 200,
        message: "Stocks retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, quantity, purchasePrice } = req.body;

      // Validation
      if (!name || !quantity || !purchasePrice) {
        res.status(400).json({
          success: false,
          message: "Name, quantity, and purchase price are required",
        });
        return;
      }

      if (quantity < 0) {
        res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
        return;
      }

      if (purchasePrice < 0) {
        res.status(400).json({
          success: false,
          message: "Purchase price cannot be negative",
        });
        return;
      }

      const asset = await itemService.createItem({
        name,
        description,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        type: ItemType.ASSET,
      });

      ApiResponse({
        res,
        statusCode: 201,
        message: "Asset created successfully",
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  async createStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, quantity, purchasePrice } = req.body;

      // Validation
      if (!name || !quantity || !purchasePrice) {
        res.status(400).json({
          success: false,
          message: "Name, quantity, and purchase price are required",
        });
        return;
      }

      if (quantity < 0) {
        res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
        return;
      }

      if (purchasePrice < 0) {
        res.status(400).json({
          success: false,
          message: "Purchase price cannot be negative",
        });
        return;
      }

      const stock = await itemService.createItem({
        name,
        description,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        type: ItemType.STOCK,
      });

      ApiResponse({
        res,
        statusCode: 201,
        message: "Stock created successfully",
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, quantity, purchasePrice } = req.body;

      // Validation
      if (quantity !== undefined && quantity < 0) {
        res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
        return;
      }

      if (purchasePrice !== undefined && purchasePrice < 0) {
        res.status(400).json({
          success: false,
          message: "Purchase price cannot be negative",
        });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (quantity !== undefined) updateData.quantity = Number(quantity);
      if (purchasePrice !== undefined)
        updateData.purchasePrice = Number(purchasePrice);

      const asset = await itemService.updateItem(
        id,
        ItemType.ASSET,
        updateData
      );

      ApiResponse({
        res,
        statusCode: 200,
        message: "Asset updated successfully",
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, quantity, purchasePrice } = req.body;

      // Validation
      if (quantity !== undefined && quantity < 0) {
        res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
        return;
      }

      if (purchasePrice !== undefined && purchasePrice < 0) {
        res.status(400).json({
          success: false,
          message: "Purchase price cannot be negative",
        });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (quantity !== undefined) updateData.quantity = Number(quantity);
      if (purchasePrice !== undefined)
        updateData.purchasePrice = Number(purchasePrice);

      const stock = await itemService.updateItem(
        id,
        ItemType.STOCK,
        updateData
      );

      ApiResponse({
        res,
        statusCode: 200,
        message: "Stock updated successfully",
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await itemService.deleteItem(id, ItemType.ASSET);

      ApiResponse({
        res,
        statusCode: 200,
        message: "Asset deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await itemService.deleteItem(id, ItemType.STOCK);

      ApiResponse({
        res,
        statusCode: 200,
        message: "Stock deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId, quantityChange, reason } = req.body;
      const recordedById = (req as any).user?.id;

      if (!recordedById) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Validation
      if (!itemId || quantityChange === undefined || !reason) {
        res.status(400).json({
          success: false,
          message: "Item ID, quantity change, and reason are required",
        });
        return;
      }

      if (reason.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Reason cannot be empty",
        });
        return;
      }

      const result = await itemService.createAdjustment({
        itemId,
        quantityChange: Number(quantityChange),
        reason,
        recordedById,
      });

      ApiResponse({
        res,
        statusCode: 201,
        message: "Adjustment created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AssetStockController();
