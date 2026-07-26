import { supabase } from "../config/supabase";
import { sessionService } from "../services/session.service";

export async function authMiddleware(req: { headers: Record<string, string>; ip?: string }) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization header");
  }

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Invalid token format");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid token");

  await sessionService.validateSession(
    token,
    req.headers["x-device-fingerprint"],
    req.ip,
  );

  return { userId: data.user.id, email: data.user.email, role: data.user.role };
}