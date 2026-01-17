import winston from 'winston';
import fs from 'fs';
import path from 'path';
import nrWinstonEnricher from '@newrelic/winston-enricher';

const nrEnricher = nrWinstonEnricher(winston);
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    nrEnricher(), // Agrega metadatos de New Relic
    // produccion logs en json
    process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
});

logger.exitOnError = false;
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}
