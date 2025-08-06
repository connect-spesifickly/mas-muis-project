import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import * as Yup from "yup";

import { corsOptions, PORT } from "./config";
import { ResponseError } from "./helpers/error";

import apiRouter from "./routes/api.router";

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors(corsOptions));
    this.app.options("*", (req, res) => {
      // Dynamic CORS origin for manual OPTIONS
      const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
        : ["http://localhost:3000"];
      const reqOrigin = req.headers.origin;
      if (reqOrigin && allowedOrigins.includes(reqOrigin)) {
        res.header("Access-Control-Allow-Origin", reqOrigin);
      } else {
        res.header("Access-Control-Allow-Origin", "");
      }
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
      res.sendStatus(204);
    });
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.use("/api", apiRouter);
    this.app.get("/api", (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes("/api/")) {
        res.status(404).send("Not found !");
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (!err) {
          next();
          return;
        }

        // Log error for debugging
        console.error("Error occurred:", {
          message: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString(),
        });

        if (err instanceof ResponseError) {
          res.status(err.code || 500).json({
            success: false,
            error: {
              message: err.message,
            },
          });
        } else if (err instanceof Yup.ValidationError) {
          res.status(400).json({
            success: false,
            error: {
              message: err.errors[0],
              details: err.errors,
            },
          });
        } else if (err instanceof jwt.TokenExpiredError) {
          res.status(401).json({
            success: false,
            error: {
              message: "Token expired, please login again",
            },
          });
        } else if (err instanceof jwt.JsonWebTokenError) {
          res.status(401).json({
            success: false,
            error: {
              message: "Invalid token",
            },
          });
        } else {
          // Handle Prisma errors
          const errorMessage = err.message;
          if (
            errorMessage.includes("Database") ||
            errorMessage.includes("Prisma")
          ) {
            res.status(503).json({
              success: false,
              error: {
                message: "Database connection error, please try again later",
                originalMessage:
                  process.env.NODE_ENV === "development"
                    ? errorMessage
                    : undefined,
              },
            });
          } else {
            res.status(500).json({
              success: false,
              error: {
                message: "Something went wrong, please try again later",
                originalMessage:
                  process.env.NODE_ENV === "development"
                    ? errorMessage
                    : undefined,
              },
            });
          }
        }
      }
    );
  }
  public getServer(): Express {
    return this.app;
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
