const winston = require('winston');
const path = require('path');
const { combine, timestamp, printf, errors } = winston.format;
const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});
const auditLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(__dirname, '../logs/audit.log') }),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
module.exports = { auditLogger };
