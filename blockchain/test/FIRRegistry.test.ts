import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('FIRRegistry', function () {
  let contract: any;
  let owner: any;
  let otherAccount: any;

  before(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    
    const FIRRegistry = await ethers.getContractFactory('FIRRegistry');
    contract = await FIRRegistry.deploy();
    await contract.waitForDeployment();
  });

  describe('Registration', function () {
    it('Should register a new FIR', async function () {
      const firId = 'FIR-2026-0001';
      const dataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const status = 'SUBMITTED';

      await expect(contract.registerFIR(firId, dataHash, status))
        .to.emit(contract, 'FIRRegistered')
        .withArgs(firId, dataHash, status);

      const record = await contract.getFIR(firId);
      expect(record.dataHash).to.equal(dataHash);
      expect(record.status).to.equal(status);
      expect(record.exists).to.be.true;
    });

    it('Should revert if FIR already exists', async function () {
      const firId = 'FIR-2026-0001'; // Same as previous test
      const dataHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678';
      const status = 'UNDER_REVIEW';

      await expect(contract.registerFIR(firId, dataHash, status))
        .to.be.revertedWith('FIRRegistry: FIR already exists');
    });
  });

  describe('Update', function () {
    it('Should update an existing FIR', async function () {
      const firId = 'FIR-2026-0002';
      const initialHash = '0x1111111111111111111111111111111111111111111111111111111111111111';
      const newHash = '0x2222222222222222222222222222222222222222222222222222222222222222';
      const status = 'VERIFIED';

      await contract.registerFIR(firId, initialHash, 'SUBMITTED');
      await expect(contract.updateFIR(firId, newHash, status))
        .to.emit(contract, 'FIRUpdated')
        .withArgs(firId, newHash, status);

      const record = await contract.getFIR(firId);
      expect(record.dataHash).to.equal(newHash);
      expect(record.status).to.equal(status);
    });

    it('Should revert if FIR does not exist', async function () {
      const firId = 'FIR-NOT-EXIST';
      const dataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const status = 'SUBMITTED';

      await expect(contract.updateFIR(firId, dataHash, status))
        .to.be.revertedWith('FIRRegistry: FIR does not exist');
    });
  });

  describe('Verification', function () {
    it('Should return true for matching hash', async function () {
      const firId = 'FIR-2026-0003';
      const dataHash = '0x3333333333333333333333333333333333333333333333333333333333333333';

      await contract.registerFIR(firId, dataHash, 'SUBMITTED');
      const result = await contract.verifyFIR(firId, dataHash);
      expect(result).to.be.true;
    });

    it('Should return false for mismatched hash', async function () {
      const firId = 'FIR-2026-0004';
      const originalHash = '0x4444444444444444444444444444444444444444444444444444444444444444';
      const tamperedHash = '0x5555555555555555555555555555555555555555555555555555555555555555';

      await contract.registerFIR(firId, originalHash, 'SUBMITTED');
      const result = await contract.verifyFIR(firId, tamperedHash);
      expect(result).to.be.false;
    });
  });

  describe('Access Control', function () {
    it('Should only allow owner to register/update', async function () {
      const firId = 'FIR-RESTRICTED';
      const dataHash = '0x6666666666666666666666666666666666666666666666666666666666666666';
      const status = 'SUBMITTED';

      // Try to register from non-owner account
      await expect(
        contract.connect(otherAccount).registerFIR(firId, dataHash, status)
      ).to.be.revertedWith('FIRRegistry: Caller is not the owner');
    });

    it('Should allow anyone to verify/getFIR (view functions)', async function () {
      const firId = 'FIR-VIEW';
      const dataHash = '0x7777777777777777777777777777777777777777777777777777777777777777';

      await contract.registerFIR(firId, dataHash, 'SUBMITTED');
      
      // Non-owner should be able to verify
      const result = await contract.connect(otherAccount).verifyFIR(firId, dataHash);
      expect(result).to.be.true;

      // Non-owner should be able to getFIR
      const record = await contract.connect(otherAccount).getFIR(firId);
      expect(record.exists).to.be.true;
    });
  });

  describe('Exists check', function () {
    it('Should return true for existing FIR', async function () {
      const firId = 'FIR-EXISTS';
      const dataHash = '0x8888888888888888888888888888888888888888888888888888888888888888';

      await contract.registerFIR(firId, dataHash, 'SUBMITTED');
      const exists = await contract.exists(firId);
      expect(exists).to.be.true;
    });

    it('Should return false for non-existing FIR', async function () {
      const exists = await contract.exists('FIR-NOT-EXIST');
      expect(exists).to.be.false;
    });
  });
});