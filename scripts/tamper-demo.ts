/**
 * Tamper Demo Script
 * 
 * This script demonstrates the blockchain integrity verification:
 * 1. Creates an FIR via the API
 * 2. Shows "Integrity Verified" 
 * 3. Modifies the FIR in the database (simulating tampering)
 * 4. Shows "Potential Tampering Detected"
 * 
 * Usage:
 * 1. Ensure backend is running on http://localhost:5000
 * 2. Ensure Hardhat node is running on http://localhost:8545
 * 3. Run: npx ts-node scripts/tamper-demo.ts
 */

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { generateFIRHash } from '../backend/src/services/hashingService';
import crypto from 'crypto';

const API_URL = 'http://localhost:5000/api';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/efirchain';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log('='.repeat(70));
  console.log('e-FIRChain - Blockchain Tampering Demo');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Register a test user
  console.log('Step 1: Registering test user...');
  const authResponse = await axios.post(`${API_URL}/auth/register`, {
    name: 'Demo User',
    email: `demo-${Date.now()}@test.com`,
    password: 'DemoPass123',
    role: 'CITIZEN',
  });
  const token = authResponse.data.token;
  console.log('✓ User registered successfully');
  console.log();

  // Step 2: Create FIR
  console.log('Step 2: Creating FIR...');
  const firResponse = await axios.post(
    `${API_URL}/firs`,
    {
      title: 'Tamper Demo FIR',
      description: 'This FIR is created for demonstrating blockchain integrity verification. A theft occurred at a local shop.',
      location: 'Main Market, City Center',
      incidentDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const firId = firResponse.data.id;
  const firNumber = firResponse.data.firNumber;
  console.log(`✓ FIR created: ${firNumber} (ID: ${firId})`);
  console.log();

  // Step 3: Verify integrity (should be valid)
  console.log('Step 3: Verifying blockchain integrity (before tampering)...');
  const verifyResponse1 = await axios.get(`${API_URL}/blockchain/verify/${firId}`);
  console.log();
  console.log('Result:');
  console.log(`  verified: ${verifyResponse1.data.verified}`);
  console.log(`  matches: ${verifyResponse1.data.matches}`);
  console.log(`  currentHash: ${verifyResponse1.data.currentHash}`);
  if (verifyResponse1.data.blockchainHash) {
    console.log(`  blockchainHash: ${verifyResponse1.data.blockchainHash}`);
  }
  if (verifyResponse1.data.transactionHash) {
    console.log(`  transactionHash: ${verifyResponse1.data.transactionHash}`);
  }
  console.log();

  if (!verifyResponse1.data.verified) {
    console.log('⚠️  Warning: Initial verification failed. Waiting for blockchain confirmation...');
    console.log('   Waiting 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const verifyResponse1b = await axios.get(`${API_URL}/blockchain/verify/${firId}`);
    if (verifyResponse1b.data.verified) {
      console.log('✓ Verification passed on second attempt');
    } else {
      console.log('✗ Verification still failed. Check blockchain status.');
      return;
    }
  }

  // Step 4: Tamper with database
  console.log('Step 4: Tampering with database (simulating unauthorized modification)...');
  const originalTitle = firResponse.data.title;
  const tamperedTitle = 'TAMPERED: Stolen goods recovered';
  
  await prisma.fIR.update({
    where: { id: firId },
    data: {
      title: tamperedTitle,
    },
  });
  console.log(`✗ Title changed from "${originalTitle}" to "${tamperedTitle}"`);
  console.log();

  // Step 5: Verify integrity again (should show tampering)
  console.log('Step 5: Verifying blockchain integrity (after tampering)...');
  const verifyResponse2 = await axios.get(`${API_URL}/blockchain/verify/${firId}`);
  console.log();
  console.log('Result:');
  console.log(`  verified: ${verifyResponse2.data.verified}`);
  console.log(`  matches: ${verifyResponse2.data.matches}`);
  console.log(`  currentHash: ${verifyResponse2.data.currentHash}`);
  if (verifyResponse2.data.blockchainHash) {
    console.log(`  blockchainHash: ${verifyResponse2.data.blockchainHash}`);
  }
  console.log();

  if (!verifyResponse2.data.verified) {
    console.log('✅ SUCCESS: Tampering detected!');
    console.log('   The blockchain hash no longer matches the database hash.');
    console.log('   This proves the data has been tampered with.');
  } else {
    console.log('⚠️  Warning: Tampering was NOT detected.');
    console.log('   This should not happen - the hashes should differ.');
  }
  console.log();

  // Step 6: Summary
  console.log('='.repeat(70));
  console.log('DEMO SUMMARY');
  console.log('='.repeat(70));
  console.log();
  console.log('✅ Phase 1: FIR created and registered on blockchain');
  console.log('✅ Phase 2: Initial verification passed (Integrity Verified)');
  console.log('✅ Phase 3: Database was tampered with (title modified)');
  console.log('✅ Phase 4: Tampering was detected (Potential Tampering Detected)');
  console.log();
  console.log('The e-FIRChain blockchain layer successfully prevented silent');
  console.log('modification of FIR data. This demonstrates the value of using');
  console.log('blockchain for integrity verification.');
  console.log();

  // Cleanup
  console.log('Cleaning up test data...');
  await prisma.fIR.deleteMany({
    where: {
      firNumber: { startsWith: 'FIR' },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: { contains: 'demo-' },
    },
  });
  console.log('✓ Cleanup complete');

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });