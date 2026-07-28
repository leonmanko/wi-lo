import { describe, it, expect } from "vitest";

// Validation manuelle des schémas Zod du router
import { z } from "zod";

const getProfileInput = z.object({ userId: z.string().uuid() });
const updateProfileInput = z.object({
  userId: z.string().uuid(),
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  favoriteSport: z.string().optional(),
  favoriteTeam: z.string().optional(),
});
const getStatsInput = z.object({ userId: z.string().uuid() });
const searchUsersInput = z.object({ query: z.string().min(2) });
const deleteInput = z.object({ userId: z.string().uuid() });

describe("UserService Router", () => {
  describe("getProfile", () => {
    it("should accept valid UUID", () => {
      expect(() => getProfileInput.parse({ userId: "123e4567-e89b-12d3-a456-426614174000" })).not.toThrow();
    });

    it("should reject invalid UUID", () => {
      expect(() => getProfileInput.parse({ userId: "not-a-uuid" })).toThrow();
    });

    it("should reject missing userId", () => {
      expect(() => getProfileInput.parse({})).toThrow();
    });
  });

  describe("updateProfile", () => {
    it("should accept valid input", () => {
      expect(() => updateProfileInput.parse({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test",
        bio: "Hello",
      })).not.toThrow();
    });

    it("should reject name too short", () => {
      expect(() => updateProfileInput.parse({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        name: "A",
      })).toThrow();
    });

    it("should reject bio too long", () => {
      expect(() => updateProfileInput.parse({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        bio: "x".repeat(501),
      })).toThrow();
    });
  });

  describe("searchUsers", () => {
    it("should accept query with 2+ chars", () => {
      expect(() => searchUsersInput.parse({ query: "ab" })).not.toThrow();
    });

    it("should reject query too short", () => {
      expect(() => searchUsersInput.parse({ query: "a" })).toThrow();
    });
  });

  describe("requestDataDeletion", () => {
    it("should accept valid UUID", () => {
      expect(() => deleteInput.parse({ userId: "123e4567-e89b-12d3-a456-426614174000" })).not.toThrow();
    });

    it("should reject invalid input", () => {
      expect(() => deleteInput.parse({ userId: 123 })).toThrow();
    });
  });
});