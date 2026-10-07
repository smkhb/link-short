import type { FastifyRateLimitOptions } from '@fastify/rate-limit';
import config from '@/config';

type RateLimitType = 'basic' | 'auth' | 'passReset';

export const defaultRateLimitOptions: Partial<FastifyRateLimitOptions> = {
  max: 100, // limit each IP to 100 requests per windowMs
  timeWindow: config.WINDOW_MS, // 1 hour in milliseconds
  addHeaders: {
    'rate-limit': true,
    'retry-after': true,
  },
};

const rateLimitOpt = new Map<RateLimitType, Partial<FastifyRateLimitOptions>>([
  ['basic', { ...defaultRateLimitOptions, max: 100 }],
  ['auth', { ...defaultRateLimitOptions, max: 10 }],
  ['passReset', { ...defaultRateLimitOptions, max: 3 }],
]);

const fastifyRateLimit = (type: RateLimitType) => {
  return rateLimitOpt.get(type) || rateLimitOpt.get('basic')!;
};

export default fastifyRateLimit;
