import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getFIRById } from '../services/firService';
import { generateFIRHash } from '../services/hashingService';
import { BlockchainService } from '../services/blockchainService';
import { AuthenticatedRequest } from '../types';

const router = Router();
let blockchainService: BlockchainService | null = null;
const getBlockchainService = () => {
  if (!blockchainService) blockchainService = new BlockchainService();
  return blockchainService;
};

// GET /api/blockchain/verify/:firId - Verify FIR integrity on blockchain
router.get('/verify/:firId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    // Get FIR with all required data
    const fir = await getFIRById(req.params.firId, req.user!.userId, req.user!.role);
    
    if (!fir) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate current hash from database
    const currentHash = generateFIRHash({
      firNumber: fir.firNumber,
      title: fir.title,
      description: fir.description,
      location: fir.location,
      incidentDate: fir.incidentDate.toISOString(),
      status: fir.status,
      createdAt: fir.createdAt.toISOString(),
      complainantId: fir.complainantId,
      officerId: fir.assignments?.[0]?.officerId,
    });

    // Get blockchain record
    let blockchainVerified = false;
    let blockchainHash = '';
    let transactionHash = '';
    let timestamp = 0n;

    if (fir.blockchainRecord) {
      const record = fir.blockchainRecord;
      blockchainHash = record.dataHash;
      transactionHash = record.transactionHash || '';
      timestamp = record.blockNumber ? BigInt(record.blockNumber) : 0n;

      // If we have a contract address, verify on-chain
      if (process.env.CONTRACT_ADDRESS && record.blockchainStatus === 'CONFIRMED') {
        try {
          blockchainVerified = await getBlockchainService().verifyFIR(
            fir.id,
            record.dataHash
          );
        } catch (error) {
          console.warn('Blockchain verification failed:', error);
        }
      }
    }

    res.status(200).json({
      verified: blockchainVerified && currentHash === blockchainHash,
      currentHash,
      blockchainHash,
      transactionHash,
      timestamp: timestamp.toString(),
      matches: currentHash === blockchainHash,
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message || 'Verification failed',
      verified: false,
    });
  }
});

export default router;