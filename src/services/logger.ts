import { supabase } from "@lib/supabase";

// Definimos los tipos de datos que podemos recibir para dar contexto
type LogContext = Record<string, unknown> | unknown[];

export interface ILogger {
  info(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
}

class AppLogger implements ILogger {
  private isProduction = import.meta.env.PROD;

  info(message: string, context?: any): void {
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
    } else {
      if (!supabase) return;

      const url =
        typeof window !== "undefined" ? window.location.href : "Unknown";

      // Enviamos a la BD de forma asíncrona (Fire-and-Forget)
      supabase
        .from("app_errors")
        .insert([
          {
            message: message + String(error),
            context: context ? context : null,
            url: url,
          },
        ])
        .then(({ error: dbError }) => {
          // Solo logueamos en modo desarrollo si la inserción falló
          if (dbError && !this.isProduction) {
            console.warn("Fallo al guardar log en Supabase:", dbError.message);
          }
        });
    }
  }
}

export const logger = new AppLogger();
