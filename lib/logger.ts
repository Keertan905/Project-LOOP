export type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogPayload {
  message: string;
  level?: LogLevel;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

export function log({ message, level = "INFO", context, error }: LogPayload) {
  const timestamp = new Date().toISOString();
  const logData: Record<string, unknown> = {
    timestamp,
    level,
    message,
    ...(context ? { context } : {}),
  };

  if (error) {
    if (error instanceof Error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else {
      logData.error = error;
    }
  }

  const jsonString = JSON.stringify(logData);

  switch (level) {
    case "ERROR":
      console.error(jsonString);
      break;
    case "WARN":
      console.warn(jsonString);
      break;
    case "INFO":
    default:
      console.log(jsonString);
      break;
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log({ message, level: "INFO", context }),
  warn: (message: string, context?: Record<string, unknown>) =>
    log({ message, level: "WARN", context }),
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) =>
    log({ message, level: "ERROR", error, context }),
};
