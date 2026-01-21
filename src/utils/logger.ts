import * as winston from 'winston';
import fs from 'fs';
import path from 'path';
import nrWinstonEnricher from '@newrelic/winston-enricher';

const nrEnricher = nrWinstonEnricher();
const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  level: 'info',
  // 💡 CAMBIO CLAVE: Quitamos el printf global para que no rompa el JSON
  format: winston.format.combine(
    nrEnricher, 
    winston.format.timestamp(),
    winston.format.json() // Esto asegura que New Relic reciba un objeto legible
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
  ],
});

// 💡 PARA LOCAL: Aquí es donde aplicamos el formato bonito (printf) solo para ti
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`
      )
    )
  }));
}