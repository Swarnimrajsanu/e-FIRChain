'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Clock, CheckCircle, ArrowRight, AlertTriangle,
  Plus, FileText, BarChart3, TrendingUp, Shield,
  ChevronRight, RefreshCw
} from 'lucide-react';

interface FIR {
  id: string;
  firNumber: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  inProgress: number;
  resolved: number;
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'SUBMITTED':          return <Clock className="w-4 h-4 text-orange-500" />;
    case 'UNDER_REVIEW':       return <Clock className="w-4 h-4 text-blue-500" />;
    case 'VERIFIED':           return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'ASSIGNED':           return <ArrowRight className="w-4 h-4 text-purple-500" />;
    case 'INVESTIGATION_IN_PROGRESS': return <ArrowRight className="w-4 h-4 text-yellow-600" />;
    case 'RESOLVED':           return <CheckCircle className="w-4 h-4 text-teal-600" />;
    case 'CLOSED':             return <CheckCircle className="w-4 h-4 text-gray-500" />;
    case 'REJECTED':           return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:                   return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export default function DashboardPage() {
  const { user, isCitizen } = useAuth();
  const router = useRouter();
  const [firs, setFirs] = useState<FIR[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'POLICE') {
      router.push('/officer/dashboard');
    } else if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (isCitizen && user) loadFIRs();
  }, [isCitizen, user]);

  const loadFIRs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.get('/firs');
      setFirs(data);
      setStats({
        total: data.length,
        inProgress: data.filter((f: FIR) =>
          ['UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'INVESTIGATION_IN_PROGRESS'].includes(f.status)
        ).length,
        resolved: data.filter((f: FIR) =>
          ['RESOLVED', 'CLOSED'].includes(f.status)
        ).length,
      });
    } catch (e) {
      console.error('Failed to load FIRs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    {
      label: 'Total FIRs Filed',
      value: stats.total,
      icon: <FileText className="w-6 h-6" />,
      bg: 'bg-navy',
      border: 'border-navy',
      desc: 'All your FIRs',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <TrendingUp className="w-6 h-6" />,
      bg: 'bg-saffron',
      border: 'border-saffron',
      desc: 'Under investigation',
    },
    {
      label: 'Resolved / Closed',
      value: stats.resolved,
      icon: <CheckCircle className="w-6 h-6" />,
      bg: 'bg-gov-green',
      border: 'border-gov-green',
      desc: 'Successfully closed',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-off-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-navy border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-off-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Shield className="w-4 h-4" />
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-navy font-semibold">My Dashboard</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy font-serif">
                Welcome, {user?.name || 'Citizen'} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your FIRs and track their progress below.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadFIRs(true)}
                disabled={refreshing}
                className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:border-navy hover:text-navy px-3 py-2 rounded text-sm font-medium transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                id="file-new-fir-btn"
                onClick={() => router.push('/file-fir')}
                className="btn-saffron text-sm py-2"
              >
                <Plus className="w-4 h-4" />
                File New FIR
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value, icon, bg, border, desc }) => (
            <div key={label} className={`gov-card p-5 flex items-center gap-4 border-l-4 ${border}`}>
              <div className={`${bg} text-white w-12 h-12 rounded flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              <div>
                <div className="text-3xl font-black text-navy">{value}</div>
                <div className="font-semibold text-gray-700 text-sm">{label}</div>
                <div className="text-gray-400 text-xs">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent FIRs Table */}
        <div className="gov-card overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-saffron rounded" />
              <h2 className="font-bold text-navy text-lg">Recent FIRs</h2>
            </div>
            {firs.length > 0 && (
              <button
                onClick={() => router.push('/firs')}
                className="text-navy hover:text-saffron text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {firs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">No FIRs Found</h3>
              <p className="text-gray-500 text-sm mb-5">You haven't filed any FIRs yet.</p>
              <button
                onClick={() => router.push('/file-fir')}
                className="btn-primary text-sm"
              >
                <Plus className="w-4 h-4" />
                File Your First FIR
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>FIR Number</th>
                    <th>Title / Subject</th>
                    <th>Status</th>
                    <th>Date Filed</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {firs.slice(0, 10).map((fir) => (
                    <tr key={fir.id}>
                      <td>
                        <span className="font-mono font-semibold text-navy text-sm">{fir.firNumber}</span>
                      </td>
                      <td>
                        <span className="text-gray-800 font-medium text-sm">{fir.title}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {statusIcon(fir.status)}
                          <StatusBadge status={fir.status} size="sm" />
                        </div>
                      </td>
                      <td>
                        <span className="text-gray-500 text-sm">
                          {new Date(fir.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          id={`view-fir-${fir.id}`}
                          onClick={() => router.push(`/firs/${fir.id}`)}
                          className="text-navy hover:text-saffron font-semibold text-sm flex items-center gap-1 ml-auto transition-colors"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-6 gov-card p-4 flex items-start gap-3 bg-blue-50 border-l-4 border-navy">
          <Shield className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <span className="font-bold text-navy">Blockchain Protection Active.</span>{' '}
            All your FIR records are secured with blockchain hashing. Any tampering attempt will be
            immediately detected and flagged.
          </div>
        </div>
      </div>
    </div>
  );
}