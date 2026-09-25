'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { CheckCircle, AlertTriangle, UserPlus, Shield, Clock } from 'lucide-react';

interface Officer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

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
  assignments?: Array<{
    officer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function AdminPendingPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'assign' ? 'assign' : 'verify';

  const [activeTab, setActiveTab] = useState<'verify' | 'assign'>(initialTab);
  const [firs, setFirs] = useState<FIR[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOfficers, setSelectedOfficers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (isAdmin && user) {
      loadData();
    }
  }, [isAdmin, user]);

  const loadData = async () => {
    try {
      const [firsData, officersData] = await Promise.all([
        api.get('/firs'),
        api.get('/auth/officers').catch(() => []),
      ]);
      setFirs(firsData);
      setOfficers(officersData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load queue data:', error);
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/firs/${id}/status`, { status: 'VERIFIED' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to verify FIR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this FIR?')) return;
    setActionLoading(id);
    try {
      await api.patch(`/firs/${id}/status`, { status: 'REJECTED' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to reject FIR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignOfficer = async (firId: string) => {
    const officerId = selectedOfficers[firId];
    if (!officerId) {
      alert('Please select a Police Officer from the dropdown list.');
      return;
    }

    setActionLoading(firId);
    try {
      await api.post(`/firs/${firId}/assign`, { officerId });
      alert('Police Officer assigned successfully!');
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to assign police officer.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  const pendingVerification = firs.filter(
    (f) => f.status === 'SUBMITTED' || f.status === 'UNDER_REVIEW'
  );
  const acceptedFIRs = firs.filter((f) => f.status === 'VERIFIED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy font-serif">FIR Operations & Assignment Queue</h1>
          <p className="text-gray-600 text-sm">Verify new FIRs and assign Police Officers to accepted cases</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab('verify')}
          className={`py-3 px-5 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'verify'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Verification
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {pendingVerification.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assign')}
          className={`py-3 px-5 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'assign'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Assign Police Officer to Accepted FIRs
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {acceptedFIRs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING VERIFICATION */}
      {activeTab === 'verify' && (
        <>
          {pendingVerification.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Verifications</h2>
              <p className="text-gray-600 text-sm">All submitted FIRs have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVerification.map((fir) => (
                <div key={fir.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold text-navy">{fir.firNumber}</span>
                        <StatusBadge status={fir.status} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{fir.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(fir.id)}
                        disabled={actionLoading === fir.id}
                        className="bg-gov-green hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionLoading === fir.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Accept & Verify
                      </button>
                      <button
                        onClick={() => handleReject(fir.id)}
                        disabled={actionLoading === fir.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-900 font-medium">{fir.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Incident Date</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {new Date(fir.incidentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-800">{fir.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    <span><strong>Complainant:</strong> {fir.complainant.name} ({fir.complainant.email})</span>
                    <span>Filed: {new Date(fir.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: ASSIGN POLICE OFFICER */}
      {activeTab === 'assign' && (
        <>
          {acceptedFIRs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Accepted FIRs Awaiting Assignment</h2>
              <p className="text-gray-600 text-sm">All accepted FIRs have already been assigned to police officers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedFIRs.map((fir) => (
                <div key={fir.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-600">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-navy">{fir.firNumber}</span>
                        <StatusBadge status={fir.status} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{fir.title}</h3>
                    </div>

                    {/* Police Officer Assignment Widget */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <select
                        value={selectedOfficers[fir.id] || ''}
                        onChange={(e) =>
                          setSelectedOfficers((prev) => ({ ...prev, [fir.id]: e.target.value }))
                        }
                        className="gov-input py-2 text-sm bg-white border-blue-300 min-w-[220px]"
                      >
                        <option value="">Select Police Officer...</option>
                        {officers.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            👮‍♂️ {officer.name} ({officer.email})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAssignOfficer(fir.id)}
                        disabled={actionLoading === fir.id}
                        className="bg-navy hover:bg-navy-dark text-white px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading === fir.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Assign Officer
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-900 font-medium">{fir.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Incident Date</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(fir.incidentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-800">{fir.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    <span><strong>Complainant:</strong> {fir.complainant.name} ({fir.complainant.email})</span>
                    <span>Status: Accepted (VERIFIED)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}