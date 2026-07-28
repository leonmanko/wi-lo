import { Router } from "express";
import { authMiddleware } from "./middleware/auth";

const router = Router();

// Service URLs (variables d'environnement)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3002";
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || "http://localhost:3003";
const SOCIAL_SERVICE_URL = process.env.SOCIAL_SERVICE_URL || "http://localhost:3004";
const ECONOMY_SERVICE_URL = process.env.ECONOMY_SERVICE_URL || "http://localhost:3005";

// Auth routes (publiques)
router.post("/auth/register", async (_req, res) => {
  res.json({ message: "Route vers UserService - register" });
});

router.post("/auth/login", async (_req, res) => {
  res.json({ message: "Route vers UserService - login" });
});

// User routes (protégées)
router.get("/users/me", authMiddleware, async (_req, res) => {
  res.json({ message: "Route vers UserService - me" });
});

router.put("/users/profile", authMiddleware, async (_req, res) => {
  res.json({ message: "Route vers UserService - updateProfile" });
});

// Quiz routes
router.get("/quiz/sports", async (_req, res) => {
  res.json({ message: "Route vers QuizService - sports" });
});

router.post("/quiz/start", authMiddleware, async (_req, res) => {
  res.json({ message: "Route vers QuizService - start" });
});

// Social routes
router.get("/friends", authMiddleware, async (_req, res) => {
  res.json({ message: "Route vers SocialService - friends" });
});

// Economy routes
router.get("/wallet", authMiddleware, async (_req, res) => {
  res.json({ message: "Route vers EconomyService - wallet" });
});

export default router;