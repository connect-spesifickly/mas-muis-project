import { Router, Request, Response } from "express";
import prisma from "../prisma";

export const cronRouter = () => {
  const router = Router();

  // Lightweight DB ping to keep the database warm
  router.get("/ping-db", async (req: Request, res: Response) => {
    const startedAt = Date.now();
    try {
      // Run a super-cheap query
      const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
      const durationMs = Date.now() - startedAt;

      const payload = {
        ok: true,
        result: result?.[0]?.ok === 1,
        durationMs,
        timestamp: new Date().toISOString(),
        // Helps correlating in hosting logs
        requestId: (req.headers["x-vercel-id"] as string) || undefined,
      };

      console.info("[cron] DB ping success", payload);
      res.json(payload);
    } catch (error: any) {
      const durationMs = Date.now() - startedAt;
      const payload = {
        ok: false,
        error: error?.message || String(error),
        durationMs,
        timestamp: new Date().toISOString(),
      };
      console.error("[cron] DB ping failed", payload);
      res.status(500).json(payload);
    }
  });

  return router;
};
