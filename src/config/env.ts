import 'dotenv/config';
import { z } from 'zod';

const toBoolean = (value: string | undefined): boolean => value === 'true' || value === '1';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    MONGODB_URI: z
      .string()
      .min(1, 'MONGODB_URI is required')
      .refine(
        (value) => /^mongodb(\+srv)?:\/\//.test(value),
        'MONGODB_URI must be a valid MongoDB connection string',
      ),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
    CORS_ORIGIN: z.string().default('*'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(60),
    STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: z.string().default('uploads'),
    MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(5),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    EXPOSE_PASSWORD_RESET_TOKEN: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.STORAGE_PROVIDER !== 's3') {
      return;
    }
    const requiredKeys = [
      'S3_BUCKET',
      'S3_REGION',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
    ] as const;
    for (const key of requiredKeys) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} is required when STORAGE_PROVIDER=s3`,
          path: [key],
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    'Invalid environment configuration. Check the required variables in .env.example.',
  );
}

const data = parsed.data;

export const env = {
  ...data,
  isProduction: data.NODE_ENV === 'production',
  isTest: data.NODE_ENV === 'test',
  exposePasswordResetToken:
    data.NODE_ENV !== 'production' || toBoolean(data.EXPOSE_PASSWORD_RESET_TOKEN),
};
