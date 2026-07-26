export class AgeService {
  private readonly MIN_AGE = 13;
  private readonly ADULT_AGE = 18;

  verifyAge(birthDate: string): { isMinor: boolean; canRegister: boolean } {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    if (age < this.MIN_AGE) {
      return { isMinor: true, canRegister: false };
    }

    return { isMinor: age < this.ADULT_AGE, canRegister: true };
  }

  getAdsConfig(isMinor: boolean) {
    return {
      personalizedAds: !isMinor,
      sensitiveCategories: !isMinor,
      adFrequencyLimit: isMinor ? 2 : 5,
    };
  }
}

export const ageService = new AgeService();