import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import multer from 'multer';

// ── Allowed file config ──────────────────────────────────────────────────────
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ── Cloudflare R2 client ─────────────────────────────────────────────────────
// R2 is S3-compatible; we point the endpoint at the R2 account endpoint.
const r2Client = new S3Client({
  region: 'auto',                                   // R2 always uses 'auto'
  endpoint: process.env.R2_ENDPOINT,                // https://<accountId>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID     || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  // Force path-style so the SDK doesn't try to virtualhost on R2 endpoints
  forcePathStyle: true,
});

const BUCKET = process.env.R2_BUCKET_NAME || 'efirchain-evidence';

// ── Multer — keep files in memory before sending to R2 ───────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, PDF, DOCX'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a SHA-256 hash of a file buffer (for blockchain integrity) */
export const computeFileHash = (buffer: Buffer): string =>
  crypto.createHash('sha256').update(buffer).digest('hex');

/** Generate a unique R2 object key for an evidence file */
export const buildObjectKey = (firId: string, originalName: string): string => {
  const ext = originalName.split('.').pop() || 'bin';
  const uid = crypto.randomBytes(12).toString('hex');
  return `evidence/${firId}/${uid}.${ext}`;
};

/** Human-readable list of allowed types */
export const getAllowedFileTypes = (): string =>
  ALLOWED_FILE_TYPES.map((t) => t.split('/')[1].toUpperCase()).join(', ');

// ── Core storage operations ──────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudflare R2.
 * Returns the public URL (or a private key if no public domain is set).
 */
export const uploadToR2 = async (
  buffer: Buffer,
  key: string,
  mimeType: string,
  metadata?: Record<string, string>
): Promise<{ key: string; url: string }> => {
  const command = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
    Metadata:    metadata,
  });

  await r2Client.send(command);

  // Build a public URL if R2_PUBLIC_DOMAIN is configured (custom domain / R2 public bucket)
  // Otherwise fall back to the endpoint-based path URL
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  const url = publicDomain
    ? `${publicDomain.replace(/\/$/, '')}/${key}`
    : `${process.env.R2_ENDPOINT}/${BUCKET}/${key}`;

  return { key, url };
};

/**
 * Generate a short-lived pre-signed URL for private object access (7 days default).
 */
export const getPresignedUrl = async (
  key: string,
  expiresInSeconds = 60 * 60 * 24 * 7
): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
};

/**
 * Delete an object from R2 (e.g., on FIR deletion or evidence retraction).
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await r2Client.send(command);
};

/**
 * Check whether an object exists in R2 without downloading it.
 */
export const objectExists = async (key: string): Promise<boolean> => {
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
};

// ── Validation ───────────────────────────────────────────────────────────────

export const validateFile = (
  file: any
): { valid: boolean; error?: string } => {
  if (!file) return { valid: false, error: 'No file uploaded' };

  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${getAllowedFileTypes()}`,
    };
  }

  if (file.size > FILE_SIZE_LIMIT) {
    return { valid: false, error: 'File size exceeds 10 MB limit' };
  }

  return { valid: true };
};

export const uploadFileSchema = {
  bounds:    { fileSize: FILE_SIZE_LIMIT },
  filetypes: ALLOWED_FILE_TYPES,
};