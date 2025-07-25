import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { ItemType } from "@prisma/client";

class ItemService {
  async list(type: string) {
    if (!type || !(type === "ASSET" || type === "STOCK"))
      throw new ResponseError(400, "Invalid type");
    const items = await prisma.item.findMany({
      where: { type: type as ItemType, quantity: { gt: 0 } },
      orderBy: { name: "asc" },
    });
    const totalValue = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.purchasePrice),
      0
    );
    return { items, totalValue };
  }
  async adjust(
    data: { itemId: string; quantityChange: number; reason: string },
    userId?: string
  ) {
    if (!data.reason) throw new ResponseError(400, "Reason is required");
    return prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: data.itemId } });
      if (!item) throw new ResponseError(404, "Item not found");
      const newQty = item.quantity + data.quantityChange;
      if (newQty < 0)
        throw new ResponseError(400, "Quantity cannot be negative");
      await tx.item.update({
        where: { id: data.itemId },
        data: { quantity: newQty },
      });
      await tx.itemAdjustment.create({
        data: {
          itemId: data.itemId,
          quantityChange: data.quantityChange,
          reason: data.reason,
          recordedById: userId!,
        },
      });
      return { success: true };
    });
  }
}

export default new ItemService();
