import prisma from '../lib/prisma';
import { computeAuditHash } from '../utils/hash';

interface AuditLogInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Create a tamper-evident audit log entry with SHA-256 hash chain.
 */
export async function createAuditLog(input: AuditLogInput) {
  // Get the last audit log entry for hash chaining
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { sequence: 'desc' },
    select: { hash: true },
  });

  const prevHash = lastLog?.hash || null;
  const timestamp = new Date().toISOString();

  const hash = computeAuditHash({
    prevHash,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId || null,
    before: input.before,
    after: input.after,
    timestamp,
  });

  const auditLog = await prisma.auditLog.create({
    data: {
      actorId: input.actorId || null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      before: input.before as any,
      after: input.after as any,
      metadata: input.metadata as any,
      prevHash,
      hash,
      timestamp: new Date(timestamp),
    },
  });

  return auditLog;
}

/**
 * Verify the integrity of the entire audit log hash chain.
 * Returns { valid: true } or { valid: false, brokenAt: sequence, details: string }
 */
export async function verifyAuditChain(): Promise<{
  valid: boolean;
  totalRecords: number;
  brokenAt?: number;
  details?: string;
}> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { sequence: 'asc' },
  });

  if (logs.length === 0) {
    return { valid: true, totalRecords: 0 };
  }

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const expectedPrevHash = i === 0 ? null : logs[i - 1].hash;

    // Check prevHash linkage
    if (log.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        totalRecords: logs.length,
        brokenAt: log.sequence,
        details: `Hash chain broken at sequence ${log.sequence}: prevHash mismatch`,
      };
    }

    // Recompute hash and verify
    const recomputedHash = computeAuditHash({
      prevHash: log.prevHash,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      before: log.before,
      after: log.after,
      timestamp: log.timestamp.toISOString(),
    });

    if (recomputedHash !== log.hash) {
      return {
        valid: false,
        totalRecords: logs.length,
        brokenAt: log.sequence,
        details: `Hash mismatch at sequence ${log.sequence}: data has been tampered`,
      };
    }
  }

  return { valid: true, totalRecords: logs.length };
}
