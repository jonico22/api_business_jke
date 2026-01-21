import path from 'path';
import fs from 'fs';

// 1. Truco definitivo: Declaramos 'require' para que TS no llore, 
//    pero usamos el require nativo de Node.js que siempre funciona.
declare function require(name: string): any;

const winston = require('winston');
const nrWinstonEnricher = require('@newrelic/winston-enricher');

const nrEnricher = nrWinstonEnricher(winston);

// Ajusta esta ruta si es necesario (ej: subir 2 niveles)
const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 2. Creamos el logger usando la instancia cargada con require
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    nrEnricher(), 
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
  ],
});

// 3. Configuración para consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info: any) => `${info.timestamp} [${info.level}]: ${info.message}`
      )
    )
  }));
}