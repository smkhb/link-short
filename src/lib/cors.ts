import type { FastifyCorsOptions } from '@fastify/cors';
import config from '@/config';

const corsOptions: FastifyCorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (config.CORS_WHITELIST.includes(origin)) {
      return callback(null, true);
    } else {
      callback(
        config.NODE_ENV === 'development'
          ? null
          : new Error('Not allowed by CORS'),
        false,
      );
    }
  },
  credentials: true,
};

export default corsOptions;
