import { AlertCircle, XCircle, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  SUBMITTED: { color: 'bg-neutral text-white', icon: <Clock className="w-3 h-3" />, label: 'Submitted' },
  UNDER_REVIEW: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-3 h-3" />, label: 'Under Review' },
  VERIFIED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Verified' },
  ASSIGNED: { color: 'bg-blue-100 text-blue-800', icon: <ArrowRight className="w-3 h-3" />, label: 'Assigned' },
  INVESTIGATION_IN_PROGRESS: { color: 'bg-amber-100 text-amber-800', icon: <ArrowRight className="w-3 h-3" />, label: 'In Investigation' },
  RESOLVED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Resolved' },
  CLOSED: { color: 'bg-neutral-500 text-white', icon: <CheckCircle className="w-3 h-3" />, label: 'Closed' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
};

export default function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    color: 'bg-gray-100 text-gray-800', 
    icon: <AlertCircle className="w-3 h-3" />, 
    label: status 
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      config.color,
      sizeClasses[size],
      className
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}