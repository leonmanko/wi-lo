import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

interface AuditEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  userId?: string;
  statusCode: number;
  durationMs: number;
  hash: string;
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const entryId = crypto.randomUUID();

  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    const entry: AuditEntry = {
      id: entryId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip || req.socket.remoteAddress || "unknown",
      userId: (req as any).userId,
      statusCode: res.statusCode,
      durationMs: duration,
      hash: "",
    };

    entry.hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(entry))
      .digest("hex");

    console.log(JSON.stringify(entry));

    return originalEnd.apply(res, args);
  };

  next();
}