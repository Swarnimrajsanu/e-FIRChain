import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
  'function registerFIR(string calldata firId, string calldata dataHash, string calldata status) external',
  'function updateFIR(string calldata firId, string calldata newHash, string calldata newStatus) external',
  'function verifyFIR(string calldata firId, string calldata providedHash) external view returns (bool)',
  'function getFIR(string calldata firId) external view returns (string memory, uint256, string memory, bool)',
  'function exists(string calldata firId) external view returns (bool)',
];

export class BlockchainService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor() {
    const walletPrivateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    if (!walletPrivateKey) {
      throw new Error('BLOCKCHAIN_PRIVATE_KEY environment variable not set');
    }

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(walletPrivateKey, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
  }

  public async registerFIR(firId: string, dataHash: string, status: string): Promise<string> {
    try {
      const tx = await this.contract.registerFIR(firId, dataHash, status);
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to register FIR on blockchain: ${error.message}`);
    }
  }

  public async updateFIR(firId: string, newHash: string, newStatus: string): Promise<string> {
    try {
      const tx = await this.contract.updateFIR(firId, newHash, newStatus);
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to update FIR on blockchain: ${error.message}`);
    }
  }

  public async verifyFIR(firId: string, providedHash: string): Promise<boolean> {
    try {
      return await this.contract.verifyFIR(firId, providedHash);
    } catch (error: any) {
      throw new Error(`Failed to verify FIR on blockchain: ${error.message}`);
    }
  }

  public async getFIR(firId: string): Promise<{
    dataHash: string;
    timestamp: bigint;
    status: string;
    exists: boolean;
  }> {
    try {
      const [dataHash, timestamp, status, exists] = await this.contract.getFIR(firId);
      return { dataHash, timestamp, status, exists };
    } catch (error: any) {
      throw new Error(`Failed to get FIR from blockchain: ${error.message}`);
    }
  }

  public async exists(firId: string): Promise<boolean> {
    try {
      return await this.contract.exists(firId);
    } catch (error: any) {
      throw new Error(`Failed to check FIR existence: ${error.message}`);
    }
  }

  public async createBlockchainRecord(
    firId: string,
    dataHash: string,
    transactionHash?: string,
    blockNumber?: number
  ): Promise<any> {
    return prisma.blockchainRecord.create({
      data: {
        firId,
        dataHash,
        transactionHash: transactionHash || undefined,
        blockNumber: blockNumber || undefined,
        blockchainStatus: transactionHash ? 'PENDING' : 'PENDING',
      },
    });
  }

  public async confirmBlockchainRecord(
    firId: string,
    transactionHash: string,
    blockNumber: number
  ): Promise<any> {
    return prisma.blockchainRecord.update({
      where: { firId },
      data: {
        transactionHash,
        blockNumber,
        blockchainStatus: 'CONFIRMED',
      },
    });
  }

  public async failBlockchainRecord(
    firId: string,
    errorMessage: string
  ): Promise<any> {
    return prisma.blockchainRecord.update({
      where: { firId },
      data: {
        blockchainStatus: 'FAILED',
      },
    });
  }
}

export default BlockchainService;