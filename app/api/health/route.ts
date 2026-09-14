import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSystemHealthMetrics } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    database: { status: "unknown", latencyMs: 0 },
    storage: { status: "unknown" }
  };

  let isHealthy = true;

  // 1. Test database file latency
  try {
    const dataDir = process.env.DATA_STORE_DIR || "D:\\Website\\ChamALuoi-Data";
    const dataFile = path.join(dataDir, ".store.json");

    const dbStart = Date.now();
    if (fs.existsSync(dataFile)) {
      const stat = fs.statSync(dataFile);
      checks.database = {
        status: "healthy",
        latencyMs: Date.now() - dbStart,
        sizeKb: Math.round(stat.size / 1024),
        lastModified: stat.mtime.toISOString()
      };
    } else {
      checks.database = {
        status: "healthy",
        latencyMs: Date.now() - dbStart,
        note: "Store running on in-memory fallback"
      };
    }
  } catch (err: any) {
    isHealthy = false;
    checks.database = {
      status: "degraded",
      error: "Database check failed"
    };
  }

  // 2. Test storage upload directory
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const testFile = path.join(uploadsDir, ".health-check.tmp");
    fs.writeFileSync(testFile, "OK", "utf8");
    fs.unlinkSync(testFile);

    checks.storage = {
      status: "healthy",
      writable: true
    };
  } catch (err: any) {
    isHealthy = false;
    checks.storage = {
      status: "degraded",
      writable: false
    };
  }

  let metrics;
  try {
    metrics = getSystemHealthMetrics();
  } catch {
    metrics = { status: "running" };
  }

  const responseBody = {
    status: isHealthy ? "ok" : "degraded",
    service: "ChamALuoi Admin CMS",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    latencyMs: Date.now() - startTime,
    memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    checks,
    counts: (metrics as any).counts || {}
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/json"
    }
  });
}
