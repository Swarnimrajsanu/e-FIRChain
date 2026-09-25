import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  date?: string;
  description?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  currentStatus: string;
  className?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; filled: boolean }> = {
  SUBMITTED: { icon: <Clock className="w-5 h-5" />, filled: false },
  UNDER_REVIEW: { icon: <Clock className="w-5 h-5" />, filled: true },
  VERIFIED: { icon: <CheckCircle className="w-5 h-5" />, filled: true },
  ASSIGNED: { icon: <ArrowRight className="w-5 h-5" />, filled: true },
  INVESTIGATION_IN_PROGRESS: { icon: <ArrowRight className="w-5 h-5" />, filled: true },
  RESOLVED: { icon: <CheckCircle className="w-5 h-5" />, filled: true },
  CLOSED: { icon: <CheckCircle className="w-5 h-5" />, filled: true },
  REJECTED: { icon: <CheckCircle className="w-5 h-5" />, filled: true },
};

const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'INVESTIGATION_IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export default function Timeline({ steps, currentStatus, className = '' }: TimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {steps.map((step, index) => {
          const status = step.status;
          const config = statusConfig[status] || { icon: <Clock className="w-5 h-5" />, filled: false };
          const isPast = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          let dotColor = 'bg-gray-300';
          if (isPast) dotColor = 'bg-success';
          if (isCurrent) dotColor = 'bg-accent ring-4 ring-accent/20';
          if (isFuture) dotColor = 'bg-gray-200';

          return (
            <div key={status} className="relative pl-10">
              {/* Dot */}
              <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${dotColor} transition-all duration-300`}>
                <div className={isPast ? 'text-white' : isCurrent ? 'text-primary' : 'text-gray-400'}>
                  {config.icon}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold ${isCurrent ? 'text-primary' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </h4>
                  {step.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(step.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}