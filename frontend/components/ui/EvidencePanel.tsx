import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import api from '@/lib/api';
import { FileText, Shield, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface Evidence {
  id: string;
  fileName: string;
  fileUrl: string;
  fileHash: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  blockchainTxHash?: string;
  blockchainStatus: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EvidencePanel({ firId }: { firId: string }) {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEvidence = async () => {
    try {
      const data = await api.get(`/firs/${firId}/evidence`);
      setEvidenceList(data);
    } catch (err: any) {
      console.error('Failed to load evidence', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [firId]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_BASE_URL}/firs/${firId}/evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const newEvidence = await res.json();
      
      setEvidenceList([newEvidence, ...evidenceList]);
      setFile(null);
      alert('Evidence uploaded successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary">Blockchain Anchored Evidence</h2>
      </div>

      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Upload New Evidence</h3>
        <FileUpload
          value={file}
          onChange={setFile}
          onRemove={() => setFile(null)}
          label="Drop evidence files here"
        />
        {file && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? 'Uploading...' : 'Upload Evidence'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Evidence Records</h3>
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading evidence...</p>
        ) : evidenceList.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No evidence uploaded yet
          </p>
        ) : (
          evidenceList.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg mt-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                    {item.fileName}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded by {item.uploader.name} on {new Date(item.uploadedAt).toLocaleString()}
                  </p>
                  <p className="text-xs font-mono text-gray-400 mt-1" title="SHA-256 File Hash">
                    Hash: {item.fileHash.substring(0, 16)}...{item.fileHash.substring(item.fileHash.length - 16)}
                  </p>
                </div>
              </div>
              
              <div className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
                item.blockchainStatus === 'CONFIRMED' ? "bg-green-50 text-green-700 border-green-200" :
                item.blockchainStatus === 'PENDING' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-red-50 text-red-700 border-red-200"
              )}>
                {item.blockchainStatus === 'CONFIRMED' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span>
                  {item.blockchainStatus === 'CONFIRMED' ? 'Blockchain Verified' : item.blockchainStatus}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
