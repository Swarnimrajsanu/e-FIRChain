import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

interface VerificationBannerProps {
  verified: boolean;
  currentHash?: string;
  blockchainHash?: string;
  transactionHash?: string;
  className?: string;
}

export default function VerificationBanner({
  verified,
  currentHash,
  blockchainHash,
  transactionHash,
  className = '',
}: VerificationBannerProps) {
  if (verified === undefined) {
    return null;
  }

  if (verified) {
    return (
      <div className={clsx(
        'w-full border-l-4 border-green-500 bg-green-50 px-6 py-4',
        className
      )}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Integrity Verified</h3>
            <p className="text-green-700 mt-1 text-sm">
              This FIR record has been verified on the blockchain and has not been tampered with.
            </p>
            {transactionHash && (
              <div className="mt-2 text-xs text-green-600/80 font-mono">
                Transaction: {transactionHash.substring(0, 16)}...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'w-full border-l-4 border-red-500 bg-red-50 px-6 py-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800">Potential Tampering Detected</h3>
          <p className="text-red-700 mt-1 text-sm">
            This FIR record does not match the blockchain record. The data may have been modified.
          </p>
          <div className="mt-2 text-xs text-red-600/80 space-y-1">
            {currentHash && (
              <div className="font-mono break-all">Current Hash: {currentHash}</div>
            )}
            {blockchainHash && (
              <div className="font-mono break-all">Blockchain Hash: {blockchainHash}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerificationPending() {
  return (
    <div className="w-full border-l-4 border-blue-500 bg-blue-50 px-6 py-4">
      <div className="flex items-start gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
        <div>
          <h3 className="font-semibold text-blue-800">Blockchain Registration In Progress</h3>
          <p className="text-blue-700 mt-1 text-sm">
            Your FIR is being registered on the blockchain. This may take a few moments.
          </p>
        </div>
      </div>
    </div>
  );
}