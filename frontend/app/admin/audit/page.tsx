'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { Shield, Clock, User, FileText, Activity } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  fir?: {
    id: string;
    firNumber: string;
    title: string;
  };
}

export default function AdminAuditPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && user) {
      loadAuditLogs();
    }
  }, [isAdmin, user]);

  const loadAuditLogs = async () => {
    try {
      const data = await api.get('/audit');
      setLogs(data);
    } catch (error: any) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-serif flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            System Audit Logs
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Complete cryptographic and system trail of all actions performed in e-FIRChain.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {logs.length} Total Events Logged
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Related FIR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.user ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                          <div className="text-xs text-gray-500">{log.user.role}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.fir ? (
                      <div
                        onClick={() => router.push(`/firs/${log.fir?.id}`)}
                        className="flex items-center gap-1.5 cursor-pointer text-primary hover:underline group"
                      >
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">{log.fir.firNumber}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
