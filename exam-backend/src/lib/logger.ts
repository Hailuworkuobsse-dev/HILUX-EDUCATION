import pino from 'pino';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname'
        }
      }
    : undefined
});
