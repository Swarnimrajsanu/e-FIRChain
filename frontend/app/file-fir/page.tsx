'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  incidentDate?: string;
}

export default function FileFIRPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    incidentDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (formData.title.length > 150) {
      newErrors.title = 'Title must be 150 characters or less';
    }
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    if (!formData.incidentDate) {
      newErrors.incidentDate = 'Incident date is required';
    } else {
      const incidentDate = new Date(formData.incidentDate);
      const now = new Date();
      if (incidentDate > now) {
        newErrors.incidentDate = 'Incident date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/firs', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        incidentDate: formData.incidentDate,
      });
      
      setSuccess(true);
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      setErrors({ description: error.message || 'Failed to file FIR. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-4">FIR Successfully Filed!</h2>
          <p className="text-gray-600 mb-4">Your FIR is being processed and will be registered on the blockchain.</p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <span className="text-blue-800 font-medium">
                Redirecting to dashboard...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">File a New FIR</h1>
        <p className="text-gray-600">
          Provide details about the incident. Your FIR will be reviewed and verified by authorities.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title of Incident *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={() => setErrors({ ...errors, title: undefined })}
              className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent`}
              placeholder="Brief description of the incident"
            />
            {errors.title && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {errors.title}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/150 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description * (min 20 characters)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => setErrors({ ...errors, description: undefined })}
              rows={5}
              className={`w-full px-4 py-3 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent`}
              placeholder="Provide detailed information about the incident..."
            />
            {errors.description && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {errors.description}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location of Incident *
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              onBlur={() => setErrors({ ...errors, location: undefined })}
              className={`w-full px-4 py-3 border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent`}
              placeholder="City, District, State"
            />
            {errors.location && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {errors.location}
              </div>
            )}
          </div>

          {/* Incident Date */}
          <div>
            <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Incident *
            </label>
            <input
              id="incidentDate"
              type="date"
              value={formData.incidentDate}
              onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              onBlur={() => setErrors({ ...errors, incidentDate: undefined })}
              className={`w-full px-4 py-3 border ${errors.incidentDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent`}
            />
            {errors.incidentDate && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {errors.incidentDate}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit FIR'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Clock className="w-6 h-6 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">After submission, your FIR will:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Be reviewed by authorities (status: SUBMITTED)</li>
            <li>Be verified and assigned to an officer (status: VERIFIED)</li>
            <li>Be registered on the blockchain for integrity verification</li>
            <li>Allow you to track progress in real-time</li>
          </ol>
        </div>
      </div>
    </div>
  );
}