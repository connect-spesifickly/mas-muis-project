import { Router } from "express";
import { authRouter } from "./auth.router";
import { userRouter } from "./user.router";
import { serviceRouter } from "./service.router";
import { customerRouter } from "./customer.router";
import { itemRouter } from "./item.router";
import { transactionRouter } from "./transaction.router";
import { reportRouter } from "./report.router";

const apiRouter = Router();

apiRouter.use("/auth", authRouter());
apiRouter.use("/users", userRouter());
apiRouter.use("/services", serviceRouter());
apiRouter.use("/customers", customerRouter());
apiRouter.use("/items", itemRouter());
apiRouter.use("/transactions", transactionRouter());
apiRouter.use("/reports", reportRouter());

export default apiRouter;
