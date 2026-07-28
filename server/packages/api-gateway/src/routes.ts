import { Router } from "express";
import { authMiddleware } from "./middleware/auth";
import { authLimiter, apiLimiter, quizLimiter } from "./middleware/rateLimits";

const router = Router();

// Service URLs (variables d'environnement)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3002";
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || "http://localhost:3003";
const SOCIAL_SERVICE_URL = process.env.SOCIAL_SERVICE_URL || "http://localhost:3004";
const ECONOMY_SERVICE_URL = process.env.ECONOMY_SERVICE_URL || "http://localhost:3005";

// Auth routes (publiques)
router.post("/auth/register", authLimiter, async (_req, res) => {
  res.json({ message: "UserService - register" });
});

router.post("/auth/login", authLimiter, async (_req, res) => {
  res.json({ message: "UserService - login" });
});

router.get("/users/me", apiLimiter, authMiddleware, async (_req, res) => {
  res.json({ message: "UserService - me" });
});

router.post("/quiz/start", quizLimiter, authMiddleware, async (_req, res) => {
  res.json({ message: "QuizService - start" });
});

router.get("/friends", apiLimiter, authMiddleware, async (_req, res) => {
  res.json({ message: "SocialService - friends" });
});

router.get("/wallet", apiLimiter, authMiddleware, async (_req, res) => {
  res.json({ message: "EconomyService - wallet" });
});

export default router;