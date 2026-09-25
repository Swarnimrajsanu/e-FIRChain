import { PrismaClient } from '@prisma/client';
import { generateFIRHash, FIRData } from './hashingService';
import { BlockchainService } from './blockchainService';
import { createAuditLog, AuditLogInput, AuditAction } from './auditService';

const prisma = new PrismaClient();

/**
 * Create FIR and register it on blockchain asynchronously.
 * Saves FIR to database first, marks blockchain record as PENDING,
 * then attempts to register on blockchain in background.
 */
export const createFIRWithBlockchain = async (
  complainantId: string,
  data: { title: string; description: string; location: string; incidentDate: string }
): Promise<any> => {
  const firNumber = `FIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  // Create FIR in database
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

  // Generate hash
  const hash = generateFIRHash({
    firNumber: fir.firNumber,
    title: fir.title,
    description: fir.description,
    location: fir.location,
    incidentDate: fir.incidentDate.toISOString(),
    status: fir.status,
    createdAt: fir.createdAt.toISOString(),
    complainantId: fir.complainantId,
  });

  // Create blockchain record as PENDING
  const blockchainRecord = await prisma.blockchainRecord.create({
    data: {
      firId: fir.id,
      dataHash: hash,
      blockchainStatus: 'PENDING',
    },
  });

  // Audit log
  await createAuditLog({
    userId: complainantId,
    firId: fir.id,
    action: AuditAction.FIR_CREATED,
    description: `FIR ${fir.firNumber} created and blockchain registration queued`,
  });

  // Async blockchain registration (fire and forget)
  registerOnBlockchain(fir.id, hash).catch(err => {
    console.error('Blockchain registration failed:', err);
  });

  return { fir, blockchainRecord };
};

/**
 * Update FIR status and update blockchain asynchronously.
 */
export const updateFIRStatusWithBlockchain = async (
  firId: string,
  newStatus: string,
  officerId: string,
  userId: string,
  role: string
): Promise<any> => {
  const fir = await prisma.fIR.findUnique({ where: { id: firId } });
  if (!fir) throw new Error('FIR not found');

  const updatedFIR = await prisma.fIR.update({
    where: { id: firId },
    data: { status: newStatus },
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

  // Generate new hash
  const hash = generateFIRHash({
    firNumber: updatedFIR.firNumber,
    title: updatedFIR.title,
    description: updatedFIR.description,
    location: updatedFIR.location,
    incidentDate: updatedFIR.incidentDate.toISOString(),
    status: updatedFIR.status,
    createdAt: updatedFIR.createdAt.toISOString(),
    complainantId: updatedFIR.complainantId,
    officerId: officerId,
  });

  // Update blockchain record
  const blockchainRecord = await prisma.blockchainRecord.update({
    where: { firId },
    data: {
      dataHash: hash,
      blockchainStatus: 'PENDING',
    },
  });

  // Audit log
  await createAuditLog({
    userId,
    firId,
    action: AuditAction.FIR_STATUS_CHANGED,
    description: `Status changed from ${fir.status} to ${newStatus} and blockchain update queued`,
  });

  // Async blockchain update (fire and forget)
  updateOnBlockchain(firId, hash, newStatus).catch(err => {
    console.error('Blockchain update failed:', err);
  });

  return updatedFIR;
};

/**
 * Register FIR on blockchain.
 */
async function registerOnBlockchain(firId: string, hash: string) {
  try {
    const fir = await prisma.fIR.findUnique({ where: { id: firId } });
    if (!fir) return;

    // Get blockchain service
    const bs = new BlockchainService();

    // Generate hash
    const dataHash = generateFIRHash({
      firNumber: fir.firNumber,
      title: fir.title,
      description: fir.description,
      location: fir.location,
      incidentDate: fir.incidentDate.toISOString(),
      status: fir.status,
      createdAt: fir.createdAt.toISOString(),
      complainantId: fir.complainantId,
    });

    // Register on blockchain
    const txHash = await bs.registerFIR(fir.id, dataHash, fir.status);

    // Update blockchain record
    await prisma.blockchainRecord.update({
      where: { firId },
      data: {
        transactionHash: txHash,
        blockchainStatus: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    console.log(`✅ FIR ${firId} registered on blockchain: ${txHash}`);
  } catch (error: any) {
    console.error(`❌ Failed to register FIR ${firId} on blockchain:`, error.message);
    await prisma.blockchainRecord.update({
      where: { firId },
      data: { blockchainStatus: 'FAILED' },
    });
  }
}

/**
 * Update FIR on blockchain.
 */
async function updateOnBlockchain(firId: string, hash: string, newStatus: string) {
  try {
    // Get blockchain service
    const bs = new BlockchainService();

    const txHash = await bs.updateFIR(firId, hash, newStatus);

    await prisma.blockchainRecord.update({
      where: { firId },
      data: {
        transactionHash: txHash,
        blockchainStatus: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    console.log(`✅ FIR ${firId} updated on blockchain: ${txHash}`);
  } catch (error: any) {
    console.error(`❌ Failed to update FIR ${firId} on blockchain:`, error.message);
  }
}