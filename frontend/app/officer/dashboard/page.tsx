'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';

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

export default function OfficerDashboardPage() {
  const { user, isPolice } = useAuth();
  const router = useRouter();
  const [firs, setFirs] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (isPolice && user) {
      loadFIRs();
    }
  }, [isPolice, user]);

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
      case 'ASSIGNED':
        return <ArrowRight className="w-5 h-5 text-purple-500" />;
      case 'INVESTIGATION_IN_PROGRESS':
        return <ArrowRight className="w-5 h-5 text-orange-500" />;
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
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
        <h1 className="text-2xl font-bold text-primary">My Cases</h1>
        <p className="text-gray-600">Cases assigned to you for investigation</p>
      </div>

      {firs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No cases assigned to you yet.</p>
          <p className="text-sm text-gray-500">New cases will appear here when assigned by admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firs.map((fir) => (
            <div
              key={fir.id}
              onClick={() => router.push(`/officer/cases/${fir.id}`)}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-accent transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-sm text-gray-600">{fir.firNumber}</span>
                <StatusBadge status={fir.status} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{fir.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complainant: {fir.complainant.name}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Filed: {new Date(fir.createdAt).toLocaleDateString()}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}