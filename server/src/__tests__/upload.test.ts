import { describe, it, expect } from "vitest";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function validateUpload(mimeType: string, size: number) {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error("Invalid file type");
  }
  if (size > MAX_SIZE) {
    throw new Error("File too large");
  }
  return true;
}

describe("Upload Service", () => {
  it("should accept valid JPEG", () => {
    expect(validateUpload("image/jpeg", 100000)).toBe(true);
  });

  it("should accept valid PNG", () => {
    expect(validateUpload("image/png", 500000)).toBe(true);
  });

  it("should accept valid WebP", () => {
    expect(validateUpload("image/webp", 2000000)).toBe(true);
  });

  it("should reject GIF", () => {
    expect(() => validateUpload("image/gif", 100000)).toThrow("Invalid file type");
  });

  it("should reject file too large", () => {
    expect(() => validateUpload("image/jpeg", 6000000)).toThrow("File too large");
  });

  it("should accept file at max size limit", () => {
    expect(validateUpload("image/png", MAX_SIZE)).toBe(true);
  });
});