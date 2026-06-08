/**
 * Centralized, validated environment access. Reads are lazy so that
 * importing this module never throws at build time.
 */

export const env = {
  get nodeEnv() {
    return process.env.NODE_ENV ?? 'development';
  },
  get mongoUri() {
    return process.env.MONGODB_URI?.trim() || '';
  },
  get autoSeed() {
    return (process.env.AUTO_SEED ?? 'true').toLowerCase() !== 'false';
  },
  get accessSecret() {
    return process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me_please_32chars_min';
  },
  get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me_please_32chars_min';
  },
  get accessExpiresMin() {
    return Number(process.env.JWT_ACCESS_EXPIRES_MIN ?? 15);
  },
  get refreshExpiresDays() {
    return Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 7);
  },
  get cloudinary() {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const api_key = process.env.CLOUDINARY_API_KEY?.trim();
    const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();
    if (cloud_name && api_key && api_secret) {
      return { cloud_name, api_key, api_secret };
    }
    return null;
  },
  get maxFileSizeMb() {
    return Number(process.env.MAX_FILE_SIZE_MB ?? 25);
  },
  get seedAdminEmail() {
    return process.env.SEED_ADMIN_EMAIL || 'admin@edufix.edu';
  },
  get seedAdminPassword() {
    return process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  },
  get isProd() {
    return (process.env.NODE_ENV ?? 'development') === 'production';
  },
};
