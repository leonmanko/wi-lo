import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "./middleware/auth";
import routes from "./routes";

const app = express();

// Sécurité de base
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://wi-lo.app", "https://www.wi-lo.app"]
    : "*",
  credentials: true,
}));
app.use(express.json());

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", name: "WI-LO API Gateway" });
});

// Routes (à connecter aux microservices plus tard)
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

const port = parseInt(process.env.API_GATEWAY_PORT || "3001");
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});

// Route protégée (test)
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({
    userId: (req as any).userId,
    email: (req as any).userEmail,
    role: (req as any).userRole,
  });
app.use("/", routes);
});

export default app;