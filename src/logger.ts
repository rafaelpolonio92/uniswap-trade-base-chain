import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), colorize(), customFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'errors.log', level: 'error' }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'exceptions.log' })],
})

export default logger
