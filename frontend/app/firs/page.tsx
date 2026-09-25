'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface FIR {
  id: string;
  firNumber: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function FIRsPage() {
  const { user, isCitizen } = useAuth();
  const router = useRouter();
  const [firs, setFirs] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (isCitizen && user) {
      loadFIRs();
    }
  }, [isCitizen, user]);

  const loadFIRs = async () => {
    try {
      const data = await api.get('/firs');
      setFirs(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load FIRs:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'UNDER_REVIEW':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'VERIFIED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ASSIGNED':
        return <ArrowRight className="w-5 h-5 text-purple-500" />;
      case 'INVESTIGATION_IN_PROGRESS':
        return <ArrowRight className="w-5 h-5 text-orange-500" />;
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      case 'REJECTED':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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
        <h1 className="text-2xl font-bold text-primary">My FIRs</h1>
        <p className="text-gray-600">View and track all your filed FIRs</p>
      </div>

      {firs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">You haven't filed any FIRs yet.</p>
          <button
            onClick={() => router.push('/file-fir')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
          >
            File Your First FIR
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {firs.map((fir) => (
            <div
              key={fir.id}
              onClick={() => router.push(`/firs/${fir.id}`)}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-accent transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-primary">{fir.firNumber}</span>
                    <StatusBadge status={fir.status} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{fir.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Filed on {new Date(fir.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-400">
                    {getStatusIcon(fir.status)}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}