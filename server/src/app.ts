import express from "express";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(express.json());

// Mount the user API routes
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    application: "DialectLab",
  });
});

export default app;