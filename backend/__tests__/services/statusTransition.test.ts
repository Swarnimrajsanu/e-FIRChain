import { validateStatusTransition } from '../../src/services/firService';
import { FIRStatus } from '../../src/types/fir';

describe('Status Transition Validator', () => {
  describe('Valid transitions', () => {
    it('should allow SUBMITTED -> UNDER_REVIEW', () => {
      const { valid, validNextStates } = validateStatusTransition('SUBMITTED', 'UNDER_REVIEW');
      expect(valid).toBe(true);
      expect(validNextStates).toContain('UNDER_REVIEW');
    });

    it('should allow SUBMITTED -> REJECTED', () => {
      const { valid } = validateStatusTransition('SUBMITTED', 'REJECTED');
      expect(valid).toBe(true);
    });

    it('should allow UNDER_REVIEW -> VERIFIED', () => {
      const { valid } = validateStatusTransition('UNDER_REVIEW', 'VERIFIED');
      expect(valid).toBe(true);
    });

    it('should allow VERIFIED -> ASSIGNED', () => {
      const { valid } = validateStatusTransition('VERIFIED', 'ASSIGNED');
      expect(valid).toBe(true);
    });

    it('should allow ASSIGNED -> INVESTIGATION_IN_PROGRESS', () => {
      const { valid } = validateStatusTransition('ASSIGNED', 'INVESTIGATION_IN_PROGRESS');
      expect(valid).toBe(true);
    });

    it('should allow INVESTIGATION_IN_PROGRESS -> RESOLVED', () => {
      const { valid } = validateStatusTransition('INVESTIGATION_IN_PROGRESS', 'RESOLVED');
      expect(valid).toBe(true);
    });

    it('should allow RESOLVED -> CLOSED', () => {
      const { valid } = validateStatusTransition('RESOLVED', 'CLOSED');
      expect(valid).toBe(true);
    });
  });

  describe('Invalid transitions', () => {
    it('should reject SUBMITTED -> VERIFIED (skipping UNDER_REVIEW)', () => {
      const { valid } = validateStatusTransition('SUBMITTED', 'VERIFIED');
      expect(valid).toBe(false);
    });

    it('should reject SUBMITTED -> ASSIGNED (skipping multiple steps)', () => {
      const { valid } = validateStatusTransition('SUBMITTED', 'ASSIGNED');
      expect(valid).toBe(false);
    });

    it('should reject CLOSED -> SUBMITTED (cannot go back)', () => {
      const { valid } = validateStatusTransition('CLOSED', 'SUBMITTED');
      expect(valid).toBe(false);
    });

    it('should reject REJECTED -> VERIFIED (cannot recover)', () => {
      const { valid } = validateStatusTransition('REJECTED', 'VERIFIED');
      expect(valid).toBe(false);
    });

    it('should reject RESOLVED -> INVESTIGATION_IN_PROGRESS (cannot go back)', () => {
      const { valid } = validateStatusTransition('RESOLVED', 'INVESTIGATION_IN_PROGRESS');
      expect(valid).toBe(false);
    });
  });

  describe('Valid next states', () => {
    it('should return correct valid next states for SUBMITTED', () => {
      const { validNextStates } = validateStatusTransition('SUBMITTED', 'UNDER_REVIEW');
      expect(validNextStates).toEqual(['UNDER_REVIEW', 'REJECTED']);
    });

    it('should return empty array for CLOSED', () => {
      const { validNextStates } = validateStatusTransition('CLOSED', 'CLOSED');
      expect(validNextStates).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should return validNextStates even when invalid transition is attempted', () => {
      const { valid, validNextStates } = validateStatusTransition('SUBMITTED', 'INVALID_STATUS');
      expect(valid).toBe(false);
      expect(validNextStates).toEqual(['UNDER_REVIEW', 'REJECTED']);
    });
  });
});