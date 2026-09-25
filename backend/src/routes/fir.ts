import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { firSubmissionLimiter } from '../middleware/rateLimit';
import { assignFIR, createFIR, getEvidence, getFIRById, getFIRs, updateFIRStatus, uploadEvidence } from '../services/firService';
import {
  buildObjectKey,
  computeFileHash,
  upload,
  uploadToR2,
  validateFile,
} from '../services/storageService';
import { AuthenticatedRequest } from '../types';
import { assignFIRSchema, createFIRSchema, updateStatusSchema } from '../validation/fir';

const router = Router();

// POST /api/firs - Create new FIR (CITIZEN only)
router.post('/', authenticate, requireRole('CITIZEN'), firSubmissionLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const result = createFIRSchema.safeParse({ body: req.body });
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const data = result.data.body as { title: string; description: string; location: string; incidentDate: string };
    const fir = await createFIR(req.user!.userId, data);
    res.status(201).json(fir);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create FIR' });
  }
});

// GET /api/firs - List FIRs (scoped by role)
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const firs = await getFIRs(req.user!.userId, req.user!.role);
    res.status(200).json(firs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch FIRs' });
  }
});

// GET /api/firs/:id - Get FIR by ID (scoped by role)
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const fir = await getFIRById(req.params.id, req.user!.userId, req.user!.role);
    if (!fir) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(200).json(fir);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch FIR' });
  }
});

// PATCH /api/firs/:id/status - Update FIR status (ADMIN or assigned POLICE)
router.patch('/:id/status', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const result = updateStatusSchema.safeParse({ body: req.body });
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const newStatus = result.data.body.status as string;
    const notes = result.data.body.notes as string | undefined;
    const updatedFIR = await updateFIRStatus(
      req.params.id,
      newStatus,
      req.user!.userId,
      req.user!.userId,
      req.user!.role,
      notes
    );

    res.status(200).json(updatedFIR);
  } catch (error: any) {
    if (error.validNextStates) {
      return res.status(409).json({
        error: error.message || 'Invalid status transition',
        validNextStates: error.validNextStates,
      });
    }
    res.status(403).json({ error: error.message || 'Access denied' });
  }
});

// POST /api/firs/:id/assign - Assign FIR to officer (ADMIN only)
router.post('/:id/assign', authenticate, requireRole('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const result = assignFIRSchema.safeParse({ body: req.body });
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const data = result.data.body as { officerId: string };
    const resultData = await assignFIR(
      req.params.id,
      data.officerId,
      req.user!.userId
    );
    res.status(200).json(resultData);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to assign FIR' });
  }
});

// POST /api/firs/:id/evidence - Upload evidence (CITIZEN owner or assigned POLICE)
// Uses Cloudflare R2 for file storage; file hash is stored for blockchain integrity.
router.post(
  '/:id/evidence',
  authenticate,
  upload.single('file'),          // multer parses the multipart upload into req.file
  async (req: AuthenticatedRequest, res) => {
    try {
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Compute SHA-256 hash BEFORE upload (blockchain integrity check)
      const fileHash = computeFileHash(file.buffer);

      // Build a unique R2 object key and upload
      const key = buildObjectKey(req.params.id, file.originalname);
      const { url: fileUrl } = await uploadToR2(
        file.buffer,
        key,
        file.mimetype,
        { firId: req.params.id, uploadedBy: req.user!.userId }
      );

      // Persist evidence record in DB
      const evidence = await uploadEvidence(
        req.params.id,
        req.user!.userId,
        {
          fileName: file.originalname,
          fileUrl,               // R2 URL (public or endpoint-based)
          fileHash,              // SHA-256 for blockchain verification
          fileType: file.mimetype,
        }
      );

      res.status(201).json(evidence);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to upload evidence' });
    }
  }
);

// GET /api/firs/:id/evidence - Get FIR evidence
router.get('/:id/evidence', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const fir = await getFIRById(req.params.id, req.user!.userId, req.user!.role);
    if (!fir) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const evidence = await getEvidence(req.params.id);
    res.status(200).json(evidence);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch evidence' });
  }
});

// GET /api/firs/:id/evidence/:evidenceId/url - Get presigned URL for evidence (ADMIN only)
router.get('/:id/evidence/:evidenceId/url', authenticate, requireRole('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const evidence = await prisma.evidence.findUnique({
      where: { id: req.params.evidenceId, firId: req.params.id }
    });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    const { getPresignedUrl } = await import('../services/storageService');
    const keyIndex = evidence.fileUrl.indexOf('evidence/');
    const key = keyIndex !== -1 ? evidence.fileUrl.substring(keyIndex) : evidence.fileUrl;
    
    const presignedUrl = await getPresignedUrl(key);
    res.status(200).json({ url: presignedUrl });
  } catch (error: any) {
    console.error('Error getting presigned URL:', error);
    res.status(500).json({ error: 'Failed to get presigned URL' });
  }
});

// Local validation/hash helpers removed — now imported from storageService

export default router;