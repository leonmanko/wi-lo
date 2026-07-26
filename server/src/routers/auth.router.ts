import { z } from "zod";
import { authService } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { mfaService } from "../services/mfa.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceFingerprint: z.string().optional(),
  ipAddress: z.string().optional(),
});

const mfaSchema = z.object({
  factorId: z.string().min(1),
  code: z.string().min(6),
});

export const authRouter = {
  register: async ({ input }: { input: z.infer<typeof registerSchema> }) => {
    return authService.signUp(input.email, input.password, input.name, input.birthDate);
  },

  login: async ({ input }: { input: z.infer<typeof loginSchema> }) => {
    const result = await authService.signIn(input.email, input.password);
    const session = await sessionService.createSession(
      result.user.id,
      result.accessToken,
      result.refreshToken,
      input.deviceFingerprint,
      input.ipAddress,
    );
    return session;
  },

  me: async ({ userId }: { userId: string }) => {
    return authService.getUser(userId);
  },

  logout: async ({ sessionToken }: { sessionToken: string }) => {
    await sessionService.revokeSession(sessionToken);
    return { success: true };
  },

  enableMfa: async ({ userId }: { userId: string }) => {
    return mfaService.enroll(userId, "totp");
  },

  verifyMfa: async ({ userId, input }: { userId: string; input: z.infer<typeof mfaSchema> }) => {
    return mfaService.verify(userId, input.factorId, input.code);
  },
};