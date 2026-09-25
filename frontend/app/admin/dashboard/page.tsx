'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { Clock, CheckCircle, ArrowRight, AlertTriangle, Users, FileText, UserPlus } from 'lucide-react';

interface FIRStats {
  total: number;
  submitted: number;
  verified: number;
  assigned: number;
  resolved: number;
}

interface FIR {
  id: string;
  firNumber: string;
  title: string;
  status: string;
  createdAt: string;
  complainant: {
    name: string;
  };
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<FIRStats>({ total: 0, submitted: 0, verified: 0, assigned: 0, resolved: 0 });
  const [recentFIRs, setRecentFIRs] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (isAdmin && user) {
      loadDashboardData();
    }
  }, [isAdmin, user]);

  const loadDashboardData = async () => {
    try {
      const firs = await api.get('/firs');
      
      const stats = {
        total: firs.length,
        submitted: firs.filter((f: FIR) => f.status === 'SUBMITTED').length,
        verified: firs.filter((f: FIR) => f.status === 'VERIFIED').length,
        assigned: firs.filter((f: FIR) => f.status === 'ASSIGNED').length,
        resolved: firs.filter((f: FIR) => f.status === 'RESOLVED').length,
      };
      
      setStats(stats);
      setRecentFIRs(firs.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total FIRs</p>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-primary">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-primary">{stats.verified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ArrowRight className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-primary">{stats.assigned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-primary">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Verification */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Pending Verification Queue</h2>
              <button
                onClick={() => router.push('/admin/pending')}
                className="text-sm text-accent hover:underline"
              >
                View All
              </button>
            </div>
            {stats.submitted === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-600">No FIRs pending verification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentFIRs
                  .filter((f: FIR) => f.status === 'SUBMITTED' || f.status === 'UNDER_REVIEW')
                  .slice(0, 3)
                  .map((fir) => (
                    <div
                      key={fir.id}
                      onClick={() => router.push(`/firs/${fir.id}`)}
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 hover:text-primary transition-colors">{fir.title}</p>
                        <p className="text-sm text-gray-500">
                          {fir.firNumber} - {fir.complainant?.name || 'Unknown'}
                        </p>
                      </div>
                      <StatusBadge status={fir.status} />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/pending?tab=verify')}
                className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Verify Pending FIRs</p>
                    <p className="text-xs text-gray-600">
                      {stats.submitted} pending verification
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/pending?tab=assign')}
                className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Assign Police Officer</p>
                    <p className="text-xs text-gray-600">
                      {stats.verified} accepted FIRs awaiting officer
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/audit')}
                className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Audit Log</p>
                    <p className="text-xs text-gray-600">View all system activity</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}