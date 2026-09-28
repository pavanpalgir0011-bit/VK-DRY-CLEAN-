import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  Building2, 
  RotateCw, 
  Sparkles, 
  MapPin, 
  CheckCheck, 
  XCircle 
} from 'lucide-react';

const statusConfig = {
  'Order Placed': { badgeClass: 'badge-primary', icon: Clock },
  'Order Accepted': { badgeClass: 'badge-info', icon: CheckCircle2 },
  'Pickup Assigned': { badgeClass: 'badge-purple', icon: Truck },
  'Picked Up': { badgeClass: 'badge-info', icon: PackageCheck },
  'At Store': { badgeClass: 'badge-secondary', icon: Building2 },
  'Processing': { badgeClass: 'badge-warning', icon: RotateCw },
  'Ready': { badgeClass: 'badge-purple', icon: Sparkles },
  'Out for Delivery': { badgeClass: 'badge-info', icon: MapPin },
  'Delivered': { badgeClass: 'badge-success', icon: CheckCheck },
  'Cancelled': { badgeClass: 'badge-danger', icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { badgeClass: 'badge-muted', icon: Clock };
  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.badgeClass}`}>
      <IconComponent size={14} />
      <span>{status || 'Unknown'}</span>
    </span>
  );
};

export default StatusBadge;
