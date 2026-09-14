import fs from "fs";
import path from "path";

const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "creditcard",
  "cardnumber",
  "cvv",
  "privatekey",
  "accesstoken",
  "refreshtoken",
  "sessiontoken"
]);

function redactObject(obj: any, depth = 0): any {
  if (depth > 5 || obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Redact JWT tokens if present in string
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(obj) && obj.length > 30) {
      return "[REDACTED_JWT_TOKEN]";
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, depth + 1));
  }

  if (typeof obj === "object") {
    const redacted: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lower) || lower.includes("secret") || lower.includes("password") || lower.includes("token")) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactObject(val, depth + 1);
      }
    }
    return redacted;
  }

  return obj;
}

export type LogLevel = "info" | "warn" | "error" | "security";

class ProductionLogger {
  private logToFile(level: LogLevel, message: string, meta?: any) {
    try {
      const timestamp = new Date().toISOString();
      const safeMeta = meta ? redactObject(meta) : undefined;
      const metaStr = safeMeta ? " " + JSON.stringify(safeMeta) : "";
      const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;

      // Log to standard console output
      if (level === "error" || level === "security") {
        console.error(logLine.trim());
      } else if (level === "warn") {
        console.warn(logLine.trim());
      } else {
        console.log(logLine.trim());
      }
    } catch {
      // Safe fallback
    }
  }

  info(message: string, meta?: any) {
    this.logToFile("info", message, meta);
  }

  warn(message: string, meta?: any) {
    this.logToFile("warn", message, meta);
  }

  error(message: string, error?: any, meta?: any) {
    const errMeta = {
      ...(meta || {}),
      errorMessage: error instanceof Error ? error.message : String(error)
    };
    this.logToFile("error", message, errMeta);
  }

  security(message: string, meta?: any) {
    this.logToFile("security", message, meta);
  }
}

export const logger = new ProductionLogger();
