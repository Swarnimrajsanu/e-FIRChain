'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import VerificationBanner, { VerificationPending } from '@/components/ui/VerificationBanner';
import Timeline from '@/components/ui/Timeline';
import { Clock, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

interface FIR {
  id: string;
  firNumber: string;
  title: string;
  description: string;
  location: string;
  incidentDate: string;
  status: string;
  createdAt: string;
  complainant: {
    id: string;
    name: string;
    email: string;
  };
  assignments: Array<{
    officer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  evidence: Array<{
    id: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    uploader: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  blockchainRecord?: {
    dataHash: string;
    transactionHash: string;
    blockchainStatus: string;
  };
  updates: Array<{
    id: string;
    status: string;
    description: string;
    createdAt: string;
    officer: {
      name: string;
    };
  }>;
}

const statusSteps = [
  { status: 'SUBMITTED', label: 'Submitted', icon: <Clock className="w-5 h-5" /> },
  { status: 'UNDER_REVIEW', label: 'Under Review', icon: <Clock className="w-5 h-5" /> },
  { status: 'VERIFIED', label: 'Verified', icon: <CheckCircle className="w-5 h-5" /> },
  { status: 'ASSIGNED', label: 'Assigned', icon: <ArrowRight className="w-5 h-5" /> },
  { status: 'INVESTIGATION_IN_PROGRESS', label: 'Investigation', icon: <ArrowRight className="w-5 h-5" /> },
  { status: 'RESOLVED', label: 'Resolved', icon: <CheckCircle className="w-5 h-5" /> },
  { status: 'CLOSED', label: 'Closed', icon: <CheckCircle className="w-5 h-5" /> },
];

export default function FIRDetailPage() {
  const { id } = useParams();
  const { user, isCitizen, isPolice, isAdmin } = useAuth();
  const router = useRouter();
  const [fir, setFir] = useState<FIR | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (id && (isCitizen || isPolice || isAdmin) && user) {
      loadFIR();
    }
  }, [id, isCitizen, isPolice, isAdmin, user]);

  const loadFIR = async () => {
    try {
      const data = await api.get(`/firs/${id}`);
      setFir(data);
      setLoading(false);
      verifyIntegrity(data);
    } catch (error: any) {
      console.error('Failed to load FIR:', error);
      if (error.message === 'Access denied') {
        router.push('/dashboard');
      }
      setLoading(false);
    }
  };

  const verifyIntegrity = async (f: FIR | null) => {
    if (!f) return;
    
    setVerifying(true);
    try {
      const data = await api.get(`/blockchain/verify/${f.id}`);
      setVerification(data);
    } catch (error: any) {
      console.error('Verification failed:', error);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { color: 'bg-neutral text-white', icon: <Clock className="w-3 h-3" />, label: 'Submitted' };
      case 'UNDER_REVIEW':
        return { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-3 h-3" />, label: 'Under Review' };
      case 'VERIFIED':
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Verified' };
      case 'ASSIGNED':
        return { color: 'bg-blue-100 text-blue-800', icon: <ArrowRight className="w-3 h-3" />, label: 'Assigned' };
      case 'INVESTIGATION_IN_PROGRESS':
        return { color: 'bg-amber-100 text-amber-800', icon: <ArrowRight className="w-3 h-3" />, label: 'Investigation' };
      case 'RESOLVED':
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Resolved' };
      case 'CLOSED':
        return { color: 'bg-neutral-500 text-white', icon: <CheckCircle className="w-3 h-3" />, label: 'Closed' };
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" />, label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-3 h-3" />, label: status };
    }
  };

  const steps = statusSteps.map(step => {
    const config = getStatusConfig(step.status);
    return {
      ...step,
      config,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!fir) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-gray-600">FIR not found</p>
      </div>
    );
  }

  const isVerified = verification?.verified ?? false;
  const blockchainStatus = fir.blockchainRecord?.blockchainStatus;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-primary mb-4 flex items-center gap-2"
        >
          ← Back to FIRs
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{fir.title}</h1>
            <div className="flex items-center gap-3">
              <span className="font-mono text-gray-600">{fir.firNumber}</span>
              <StatusBadge status={fir.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="mb-8">
        {blockchainStatus === 'PENDING' ? (
          <VerificationPending />
        ) : (
          <VerificationBanner
            verified={isVerified}
            currentHash={verification?.currentHash}
            blockchainHash={verification?.blockchainHash}
            transactionHash={verification?.transactionHash}
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-primary mb-4">Incident Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900 font-medium">{fir.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Incident Date</p>
                <p className="text-gray-900 font-medium">
                  {new Date(fir.incidentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900 mt-1">{fir.description}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-primary mb-6">Status Timeline</h2>
            <Timeline
              steps={steps}
              currentStatus={fir.status}
            />
          </div>

          {/* Evidence */}
          {fir.evidence.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-primary mb-4">Evidence</h2>
              <div className="space-y-3">
                {fir.evidence.map((evidence) => (
                  <div key={evidence.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      {isAdmin ? (
                        <p 
                          className="font-medium text-primary hover:underline cursor-pointer"
                          onClick={async () => {
                            try {
                              const data = await api.get(`/firs/${fir.id}/evidence/${evidence.id}/url`);
                              window.open(data.url, '_blank');
                            } catch (e) {
                              alert('Failed to open evidence file or permission denied.');
                            }
                          }}
                        >
                          {evidence.fileName} (Click to view)
                        </p>
                      ) : (
                        <p className="font-medium text-gray-900">{evidence.fileName}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Uploaded by {evidence.uploader?.name || 'Unknown'} on {new Date(evidence.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">{evidence.fileType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Updates */}
          {fir.updates && fir.updates.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Investigation Updates</h2>
              <div className="space-y-4">
                {fir.updates.map((update) => (
                  <div key={update.id} className="border-l-2 border-accent pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{update.status.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-500">{new Date(update.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                    <p className="text-xs text-gray-500 italic">By Officer {update.officer?.name || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Officer Info */}
        {fir.assignments.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-primary mb-4">Assigned Officer</h2>
            <div className="space-y-4">
              {fir.assignments.map((assignment) => (
                <div key={assignment.officer.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    {assignment.officer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{assignment.officer.name}</p>
                    <p className="text-sm text-gray-600">{assignment.officer.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complainant Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-primary mb-4">Complainant</h2>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
              {fir.complainant.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{fir.complainant.name}</p>
              <p className="text-sm text-gray-600">{fir.complainant.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}