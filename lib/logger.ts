export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, userId, ip, error } = entry;
    const levelText = LogLevel[level];
    
    let logMessage = `[${timestamp}] ${levelText}: ${message}`;
    
    if (context) logMessage += ` | Context: ${context}`;
    if (userId) logMessage += ` | User: ${userId}`;
    if (ip) logMessage += ` | IP: ${ip}`;
    if (error) logMessage += ` | Error: ${error.message}\n${error.stack}`;
    
    return logMessage;
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    context?: string, 
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...metadata
    };
  }

  error(message: string, context?: string, metadata?: Record<string, any>) {
    if (this.logLevel >= LogLevel.ERROR) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, metadata);
      console.error(this.formatLog(entry));
      
      // 프로덕션에서는 외부 로깅 서비스로 전송
      if (process.env.NODE_ENV === 'production') {
        this.sendToExternalLogger(entry);
      }
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    if (this.logLevel >= LogLevel.WARN) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context, metadata);
      console.warn(this.formatLog(entry));
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    if (this.logLevel >= LogLevel.INFO) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context, metadata);
      console.info(this.formatLog(entry));
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    if (this.logLevel >= LogLevel.DEBUG) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, metadata);
      console.debug(this.formatLog(entry));
    }
  }

  // 보안 관련 로그 (항상 기록)
  security(message: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.ERROR, `SECURITY: ${message}`, 'SECURITY', metadata);
    console.error(this.formatLog(entry));
    
    // 보안 로그는 항상 외부로 전송
    this.sendToExternalLogger(entry);
  }

  // 외부 로깅 서비스 전송 (예: Sentry, LogRocket 등)
  private sendToExternalLogger(entry: LogEntry) {
    if (process.env.SENTRY_DSN) {
      // Sentry 연동 예시
      // Sentry.captureException(entry.error || new Error(entry.message), {
      //   tags: { context: entry.context },
      //   extra: entry.metadata,
      //   user: entry.userId ? { id: entry.userId } : undefined
      // });
    }
  }

  // 활동 로그 (DB 저장)
  async logActivity(action: string, category: string, details?: any, userId?: string, ip?: string) {
    try {
      // ActivityLog 모델에 저장하는 것은 비즈니스 로직에서 처리
      this.info(`Activity: ${action}`, category, { 
        action, 
        category, 
        details, 
        userId, 
        ip 
      });
    } catch (error) {
      this.error('Failed to log activity', 'ACTIVITY_LOG', { error });
    }
  }
}

export const logger = Logger.getInstance();

// Express 에러 핸들러
export function errorHandler(error: Error, context?: string, metadata?: Record<string, any>) {
  logger.error(error.message, context, { 
    ...metadata, 
    error,
    stack: error.stack 
  });
}