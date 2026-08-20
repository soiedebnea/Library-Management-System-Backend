import express, { Application, Request, Response } from "express";
import cors from "cors";
import bookRoutes from "./routes/book.routes";
import memberRoutes from "./routes/member.routes";
import borrowRoutes from "./routes/borrow.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Library Management API is running" });
});

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrow", borrowRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;