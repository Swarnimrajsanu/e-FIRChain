import { generateFIRHash, verifyHash, hashString } from '../../src/services/hashingService';

describe('Hashing Service', () => {
  describe('generateFIRHash', () => {
    const firData = {
      firNumber: 'FIR-2026-0001',
      title: 'Theft at Shop',
      description: 'Items stolen from shop on 2026-01-15',
      location: 'Main Market, City',
      incidentDate: '2026-01-15T10:00:00Z',
      status: 'SUBMITTED',
      createdAt: '2026-01-15T11:00:00Z',
      complainantId: 'user-123',
      officerId: 'officer-456',
    };

    it('should generate a SHA-256 hash', () => {
      const hash = generateFIRHash(firData);
      
      // SHA-256 hash should be 64 characters (hex)
      expect(hash).toHaveLength(64);
      // Should be valid hex
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
    });

    it('should produce the same hash for the same input (deterministic)', () => {
      const hash1 = generateFIRHash(firData);
      const hash2 = generateFIRHash(firData);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', () => {
      const hash1 = generateFIRHash(firData);
      const differentData = { ...firData, title: 'Different Title' };
      const hash2 = generateFIRHash(differentData);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle different officerId values consistently', () => {
      const withOfficer = { ...firData, officerId: 'officer-123' };
      const withoutOfficer = { ...firData, officerId: undefined };
      
      const hashWith = generateFIRHash(withOfficer);
      const hashWithout = generateFIRHash(withoutOfficer);
      
      // Hashes should be different because officerId differs
      expect(hashWith).not.toBe(hashWithout);
    });
  });

  describe('verifyHash', () => {
    const firData = {
      firNumber: 'FIR-2026-0001',
      title: 'Theft at Shop',
      description: 'Items stolen from shop on 2026-01-15',
      location: 'Main Market, City',
      incidentDate: '2026-01-15T10:00:00Z',
      status: 'SUBMITTED',
      createdAt: '2026-01-15T11:00:00Z',
      complainantId: 'user-123',
    };

    it('should return true for matching hash', () => {
      const hash = generateFIRHash(firData);
      const isValid = verifyHash(firData, hash);
      
      expect(isValid).toBe(true);
    });

    it('should return false for mismatched hash', () => {
      const hash = generateFIRHash(firData);
      const tamperedHash = hash.substring(0, 63) + '0'; // Modify last character
      const isValid = verifyHash(firData, tamperedHash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('hashString', () => {
    it('should produce consistent hashes for the same string', () => {
      const hash1 = hashString('test string');
      const hash2 = hashString('test string');
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different strings', () => {
      const hash1 = hashString('string1');
      const hash2 = hashString('string2');
      
      expect(hash1).not.toBe(hash2);
    });
  });
});