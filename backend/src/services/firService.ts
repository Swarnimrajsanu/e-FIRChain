import { PrismaClient } from '@prisma/client';
import { AuditAction } from '../services/auditService';
import { ALLOWED_TRANSITIONS } from '../types/fir';
import { anchorEvidenceOnBlockchain } from './blockchainIntegration';

const prisma = new PrismaClient();

export const generateFIRNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.fIR.count({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  });
  const sequence = count + 1;
  return `FIR-${currentYear}-${String(sequence).padStart(4, '0')}`;
};

export const createFIR = async (
  complainantId: string,
  data: { title: string; description: string; location: string; incidentDate: string }
): Promise<any> => {
  const firNumber = await generateFIRNumber();

  const fir = await prisma.fIR.create({
    data: {
      firNumber,
      complainantId,
      title: data.title,
      description: data.description,
      location: data.location,
      incidentDate: new Date(data.incidentDate),
      status: 'SUBMITTED',
    },
    include: {
      complainant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: complainantId,
      firId: fir.id,
      action: AuditAction.FIR_CREATED,
      description: `FIR ${fir.firNumber} created by ${complainantId}`,
    },
  });

  return fir;
};

export const getFIRs = async (
  userId: string,
  role: string
): Promise<any[]> => {
  if (role === 'ADMIN') {
    return prisma.fIR.findMany({
      include: {
        complainant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          include: {
            officer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === 'POLICE') {
    return prisma.fIR.findMany({
      where: {
        assignments: {
          some: { officerId: userId },
        },
      },
      include: {
        complainant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          include: {
            officer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.fIR.findMany({
    where: {
      complainantId: userId,
    },
    include: {
      complainant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getFIRById = async (
  firId: string,
  userId: string,
  role: string
): Promise<any | null> => {
  const fir = await prisma.fIR.findUnique({
    where: { id: firId },
    include: {
      complainant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignments: {
        include: {
          officer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      evidence: {
        orderBy: { uploadedAt: 'desc' },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        include: {
          officer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      blockchainRecord: true,
    },
  });

  if (!fir) return null;

  if (role === 'ADMIN') return fir;
  if (role === 'POLICE') {
    const isAssigned = ((fir as any).assignments || []).some((a: any) => a.officerId === userId);
    if (isAssigned) return fir;
    return null;
  }
  if (fir.complainantId === userId) return fir;
  
  return null;
};

export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): { valid: boolean; validNextStates: string[] } => {
  const validNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
  const isValid = validNextStates.includes(newStatus);
  return { valid: isValid, validNextStates };
};

export const updateFIRStatus = async (
  firId: string,
  newStatus: string,
  officerId: string,
  userId: string,
  role: string
): Promise<any> => {
  const fir = await prisma.fIR.findUnique({
    where: { id: firId },
    include: { assignments: true },
  });
  
  if (!fir) {
    throw new Error('FIR not found');
  }

  if (role === 'CITIZEN') {
    throw new Error('Citizens cannot update FIR status');
  }

  if (role === 'POLICE') {
    const isAssigned = ((fir as any).assignments || []).some((a: any) => a.officerId === officerId);
    if (!isAssigned) {
      throw new Error('You are not assigned to this FIR');
    }
    const allowedForPolice = ['ASSIGNED', 'INVESTIGATION_IN_PROGRESS', 'RESOLVED'];
    if (!allowedForPolice.includes(newStatus)) {
      throw new Error('Police officers can only update: ASSIGNED, INVESTIGATION_IN_PROGRESS, RESOLVED');
    }
  }

  const { valid, validNextStates } = validateStatusTransition(fir.status, newStatus);
  if (!valid) {
    const error: any = new Error('Invalid status transition');
    error.validNextStates = validNextStates;
    throw error;
  }

  if (newStatus === 'VERIFIED' && role !== 'ADMIN') {
    throw new Error('Only ADMIN can verify FIRs');
  }

  const updatedFIR = await prisma.fIR.update({
    where: { id: firId },
    data: {
      status: newStatus,
    },
    include: {
      complainant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      firId,
      action: AuditAction.FIR_STATUS_CHANGED,
      description: `Status changed from ${fir.status} to ${newStatus} by ${userId}`,
    },
  });

  return updatedFIR;
};

export const assignFIR = async (
  firId: string,
  officerId: string,
  assignedById: string
): Promise<any> => {
  const fir = await prisma.fIR.findUnique({ where: { id: firId } });
  
  if (!fir) {
    throw new Error('FIR not found');
  }

  if (fir.status !== 'VERIFIED') {
    throw new Error('FIR must be verified before assignment');
  }

  const existingAssignment = await prisma.caseAssignment.findUnique({
    where: {
      firId_officerId: {
        firId,
        officerId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error('Officer already assigned to this FIR');
  }

  const assignment = await prisma.caseAssignment.create({
    data: {
      firId,
      officerId,
      assignedBy: assignedById,
    },
    include: {
      officer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await prisma.fIR.update({
    where: { id: firId },
    data: { status: 'ASSIGNED' },
  });

  await prisma.auditLog.create({
    data: {
      userId: assignedById,
      firId,
      action: AuditAction.FIR_ASSIGNED,
      description: `FIR ${firId} assigned to officer ${officerId} by ${assignedById}`,
    },
  });

  return { assignment, fir };
};

export const uploadEvidence = async (
  firId: string,
  uploadedBy: string,
  fileData: {
    fileName: string;
    fileUrl: string;
    fileHash: string;
    fileType: string;
  }
): Promise<any> => {
  const fir = await prisma.fIR.findUnique({ where: { id: firId } });
  
  if (!fir) {
    throw new Error('FIR not found');
  }

  const assignment = await prisma.caseAssignment.findUnique({
    where: {
      firId_officerId: {
        firId,
        officerId: uploadedBy,
      },
    },
  });

  if (fir.complainantId !== uploadedBy && !assignment) {
    throw new Error('You are not authorized to upload evidence for this FIR');
  }

  const evidence = await prisma.evidence.create({
    data: {
      firId,
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileHash: fileData.fileHash,
      fileType: fileData.fileType,
      uploadedBy,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: uploadedBy,
      firId,
      action: AuditAction.EVIDENCE_UPLOADED,
      description: `Evidence ${fileData.fileName} uploaded by ${uploadedBy}`,
    },
  });

  // Async blockchain anchoring (fire and forget)
  anchorEvidenceOnBlockchain(firId, evidence.id, fileData.fileHash, fileData.fileName).catch(err => {
    console.error('Evidence blockchain anchoring failed:', err);
  });

  return evidence;
};

export const getEvidence = async (firId: string): Promise<any[]> => {
  return prisma.evidence.findMany({
    where: { firId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  });
};