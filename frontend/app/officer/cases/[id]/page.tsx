'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import Timeline from '@/components/ui/Timeline';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';

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
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['INVESTIGATION_IN_PROGRESS', 'RESOLVED'],
  INVESTIGATION_IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
};

const STATUS_LABELS: Record<string, string> = {
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  ASSIGNED: 'Assigned',
  INVESTIGATION_IN_PROGRESS: 'Start Investigation',
  RESOLVED: 'Mark as Resolved',
  CLOSED: 'Close Case',
};

export default function OfficerCaseDetailPage() {
  const { id } = useParams();
  const { user, isPolice } = useAuth();
  const router = useRouter();
  const [fir, setFir] = useState<FIR | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (id && isPolice && user) {
      loadFIR();
    }
  }, [id, isPolice, user]);

  const loadFIR = async () => {
    try {
      const data = await api.get(`/firs/${id}`);
      setFir(data);
      setStatus(''); // always reset so officer must pick a NEW status
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load FIR:', error);
      if (error.message === 'Access denied') {
        router.push('/officer/dashboard');
      }
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status) {
      alert('Please select a status');
      return;
    }

    setUpdating(true);

    try {
      await api.patch(`/firs/${id}/status`, { status });
      setFir(prev => prev ? { ...prev, status } : null);
      setStatus(''); // reset so dropdown shows "Select a status..."
      setUpdating(false);
      alert('Status updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
      setUpdating(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-primary mb-4 flex items-center gap-2"
      >
        ← Back to Cases
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">{fir.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-sm text-gray-600">{fir.firNumber}</span>
                <StatusBadge status={fir.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-gray-900 font-medium">{fir.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Incident Date</p>
              <p className="text-gray-900 font-medium">
                {new Date(fir.incidentDate).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-1">Complainant</p>
              <p className="text-gray-900 font-medium">{fir.complainant.name}</p>
              <p className="text-sm text-gray-600">{fir.complainant.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-900">{fir.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Update Case Status</h2>
        
        <form onSubmit={handleUpdateStatus} className="space-y-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="flex items-center gap-3">
              <StatusBadge status={fir.status} size="lg" />
              <span className="text-gray-500 text-sm">(Click to update)</span>
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">Select a status...</option>
              {(ALLOWED_TRANSITIONS[fir.status] ?? []).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Investigation Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Add any investigation notes or observations..."
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </form>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-primary mb-6">Status Timeline</h2>
        <Timeline
          steps={[
            { status: 'SUBMITTED', label: 'Submitted' },
            { status: 'UNDER_REVIEW', label: 'Under Review' },
            { status: 'VERIFIED', label: 'Verified' },
            { status: 'ASSIGNED', label: 'Assigned to You' },
            { status: 'INVESTIGATION_IN_PROGRESS', label: 'Investigation In Progress' },
            { status: 'RESOLVED', label: 'Resolved' },
            { status: 'CLOSED', label: 'Closed' },
          ]}
          currentStatus={fir.status}
        />
      </div>
    </div>
  );
}