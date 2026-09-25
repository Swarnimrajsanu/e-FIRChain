import { z } from 'zod';

export const createFIRSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(150, 'Title must be 150 characters or less'),
    description: z.string()
      .min(20, 'Description must be at least 20 characters')
      .max(2000, 'Description must be 2000 characters or less'),
    location: z.string().min(1, 'Location is required'),
    incidentDate: z.string().refine((date) => {
      const incidentDate = new Date(date);
      const now = new Date();
      return incidentDate <= now;
    }, 'Incident date cannot be in the future'),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'SUBMITTED',
      'UNDER_REVIEW',
      'VERIFIED',
      'ASSIGNED',
      'INVESTIGATION_IN_PROGRESS',
      'RESOLVED',
      'CLOSED',
      'REJECTED',
    ]),
    notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
  }),
});

export const assignFIRSchema = z.object({
  body: z.object({
    officerId: z.string().min(1, 'Officer ID is required'),
  }),
});

export const uploadEvidenceSchema = z.object({
  body: z.object({
    fileName: z.string().optional(),
    fileType: z.string().optional(),
  }),
});