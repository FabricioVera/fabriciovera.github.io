// Definimos los tipos de datos que podemos recibir para dar contexto
type LogContext = Record<string, unknown> | unknown[];

export interface ILogger {
  info(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
}

class AppLogger implements ILogger {
  private isProduction = window.location.hostname !== "localhost";

  info(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.info(`🔵 [INFO]: ${message}`, context ? context : "");
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.warn(`🟠 [WARN]: ${message}`, context ? context : "");
    }
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.isProduction) {
      console.error(`🔴 [ERROR]: ${message}`, error, context ? context : "");
    }
  }
}

export const logger = new AppLogger();
