import { createLogger, format, transports } from 'winston';

const isProd = process.env.NODE_ENV === 'production';

export const logger = createLogger({
  level: 'info',
  format: isProd ? format.json() : format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()]
});
