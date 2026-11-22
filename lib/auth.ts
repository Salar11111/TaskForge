import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
  throw new Error('BETTER_AUTH_SECRET (>= 32 chars) is required in production');
}
if (process.env.NODE_ENV === 'production' && !baseURL) {
  throw new Error('BETTER_AUTH_URL is required in production');
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  secret: secret ?? 'dev-secret-change-me',
  baseURL: baseURL ?? 'http://localhost:3000',
});

export type Session = typeof auth.$Infer.Session;