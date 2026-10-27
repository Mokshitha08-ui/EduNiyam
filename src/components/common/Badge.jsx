import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    navy: 'bg-gov-50 text-gov-800 border-gov-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    navy: 'bg-gov-700',
    purple: 'bg-purple-500'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentDot = dotColors[variant] || dotColors.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${currentVariant} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'APPROVED':
    case 'VERIFIED':
    case 'COMPLIANT':
    case 'VALID':
    case 'COMPLETED':
    case 'CLEARED':
    case 'INSPECTION_COMPLETED':
      return <Badge variant="success" dot>{status.replace(/_/g, ' ')}</Badge>;

    case 'IN_REVIEW':
    case 'PENDING_SCRUTINY':
    case 'PENDING_APPROVAL':
    case 'PENDING_VERIFICATION':
    case 'PENDING_REVIEW':
    case 'PENDING_SUBMISSION':
    case 'EXPIRING_SOON':
    case 'DUE_SOON':
    case 'SCHEDULED':
    case 'EVC_SCHEDULED':
      return <Badge variant="warning" dot>{status.replace(/_/g, ' ')}</Badge>;

    case 'DEFICIENCY_NOTIFIED':
    case 'OVERDUE':
    case 'EXPIRED':
    case 'DELAYED':
    case 'REJECTED':
    case 'NON_COMPLIANT':
    case 'CORRECTION_REQUIRED':
    case 'ACTION_REQUIRED':
      return <Badge variant="danger" dot>{status.replace(/_/g, ' ')}</Badge>;

    case 'RESUBMITTED':
    case 'SUBMITTED':
    case 'UPCOMING':
      return <Badge variant="primary" dot>{status.replace(/_/g, ' ')}</Badge>;

    case 'DRAFT':
      return <Badge variant="default" dot>DRAFT</Badge>;

    default:
      return <Badge variant="default">{String(status || 'UNKNOWN').replace(/_/g, ' ')}</Badge>;
  }
};
