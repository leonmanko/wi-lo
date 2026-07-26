import { supabase } from "../config/supabase";

export class MfaService {
  async enroll(userId: string, factorType: "totp" | "phone" = "totp") {
    const { data, error } = await supabase.auth.admin.mfa.enroll({
      userId,
      factorType,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async verify(userId: string, factorId: string, code: string) {
    const { data, error } = await supabase.auth.admin.mfa.verify({
      userId,
      factorId,
      code,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async unenroll(userId: string, factorId: string) {
    const { data, error } = await supabase.auth.admin.mfa.unenroll({
      userId,
      factorId,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async getFactors(userId: string) {
    const { data, error } = await supabase.auth.admin.mfa.listFactors({ userId });
    if (error) throw new Error(error.message);
    return data;
  }
}

export const mfaService = new MfaService();