import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const AuditAction = {
  FIR_CREATED: 'FIR_CREATED',
  FIR_STATUS_CHANGED: 'FIR_STATUS_CHANGED',
  FIR_VERIFIED: 'FIR_VERIFIED',
  FIR_REJECTED: 'FIR_REJECTED',
  FIR_ASSIGNED: 'FIR_ASSIGNED',
  EVIDENCE_UPLOADED: 'EVIDENCE_UPLOADED',
  CASE_UPDATE_ADDED: 'CASE_UPDATE_ADDED',
};

export interface AuditLogInput {
  userId?: string;
  firId?: string;
  action: string;
  description?: string;
  ipAddress?: string;
}

export const createAuditLog = async (data: AuditLogInput): Promise<any> => {
  return prisma.auditLog.create({
    data: {
      userId: data.userId || null,
      firId: data.firId || null,
      action: data.action,
      description: data.description || undefined,
      ipAddress: data.ipAddress || undefined,
    },
  });
};