import crypto from 'crypto';

/**
 * Canonical JSON representation for FIR data.
 * 
 * CRITICAL: Key ordering must be deterministic to ensure the same data
 * always produces the same hash.
 * 
 * Fields included in hash (in this exact order):
 * 1. firNumber
 * 2. title
 * 3. description
 * 4. location
 * 5. incidentDate (ISO string)
 * 6. status
 * 7. createdAt (ISO string)
 * 8. complainantId
 * 9. officerId (if assigned)
 */
export interface FIRData {
  firNumber: string;
  title: string;
  description: string;
  location: string;
  incidentDate: string;
  status: string;
  createdAt: string;
  complainantId: string;
  officerId?: string;
}

/**
 * Generate a SHA-256 hash of FIR data using canonical JSON representation.
 * This ensures the same data always produces the same hash regardless of
 * object key ordering.
 */
export const generateFIRHash = (data: FIRData): string => {
  const canonicalData = {
    firNumber: data.firNumber,
    title: data.title,
    description: data.description,
    location: data.location,
    incidentDate: data.incidentDate,
    status: data.status,
    createdAt: data.createdAt,
    complainantId: data.complainantId,
    officerId: data.officerId,
  };

  // Use JSON.stringify which preserves the key order we defined
  const jsonString = JSON.stringify(canonicalData);
  
  // Compute SHA-256 hash
  return crypto.createHash('sha256').update(jsonString).digest('hex');
};

/**
 * Verify that two hashes match.
 * Used for blockchain integrity verification.
 */
export const verifyHash = (data: FIRData, storedHash: string): boolean => {
  const currentHash = generateFIRHash(data);
  return currentHash === storedHash;
};

/**
 * Hash a string directly (for testing purposes).
 */
export const hashString = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};