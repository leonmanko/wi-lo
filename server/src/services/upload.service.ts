import { supabase } from "../config/supabase";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export class UploadService {
  async uploadAvatar(userId: string, file: Buffer, mimeType: string, originalName: string) {
    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP");
    }

    if (file.length > MAX_SIZE) {
      throw new Error("File too large. Max size: 5MB");
    }

    const ext = originalName.split(".").pop() || "png";
    const fileName = `${userId}-${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return { path: data.path, url: urlData.publicUrl };
  }

  async deleteAvatar(path: string) {
    const { error } = await supabase.storage
      .from("avatars")
      .remove([path]);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}

export const uploadService = new UploadService();