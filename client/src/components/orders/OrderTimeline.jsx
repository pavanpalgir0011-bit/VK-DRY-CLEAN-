import React from 'react';
import { 
  Check, 
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

const ORDER_STAGES = [
  { key: 'Order Placed', title: 'Order Placed', desc: 'Your booking has been received.', icon: Clock },
  { key: 'Order Accepted', title: 'Order Accepted', desc: 'Wash & Wow confirmed your booking.', icon: CheckCircle2 },
  { key: 'Pickup Assigned', title: 'Pickup Assigned', desc: 'A dedicated rider is assigned for pickup.', icon: Truck },
  { key: 'Picked Up', title: 'Picked Up', desc: 'Garments collected from your doorstep.', icon: PackageCheck },
  { key: 'At Store', title: 'At Store', desc: 'Garments reached our primary processing hub.', icon: Building2 },
  { key: 'Processing', title: 'Processing', desc: 'Undergoing specialized dry cleaning & spot treatment.', icon: RotateCw },
  { key: 'Ready', title: 'Ready', desc: 'Cleaned, steam pressed, quality checked and packed.', icon: Sparkles },
  { key: 'Out for Delivery', title: 'Out for Delivery', desc: 'On its way back to your doorstep.', icon: MapPin },
  { key: 'Delivered', title: 'Delivered', desc: 'Fresh clothes handed over safely.', icon: CheckCheck },
];

const OrderTimeline = ({ currentStatus, statusHistory = [] }) => {
  const isCancelled = currentStatus === 'Cancelled';

  // Find index of current status in linear stages
  const currentIndex = ORDER_STAGES.findIndex((stage) => stage.key === currentStatus);

  // Helper to find history details
  const getHistoryItem = (statusKey) => {
    return statusHistory.find((h) => h.status === statusKey);
  };

  if (isCancelled) {
    const cancelInfo = getHistoryItem('Cancelled');
    return (
      <div style={{ padding: '1.5rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca', margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
          <XCircle size={24} />
          <h4 style={{ margin: 0, color: 'var(--danger)' }}>Order Cancelled</h4>
        </div>
        <p style={{ color: '#991b1b', margin: 0 }}>
          {cancelInfo?.note || 'This order was cancelled.'}
        </p>
        {cancelInfo?.timestamp && (
          <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '0.4rem' }}>
            {new Date(cancelInfo.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {ORDER_STAGES.map((stage, idx) => {
        const isCompleted = currentIndex > idx;
        const isCurrent = currentIndex === idx;
        const isUpcoming = currentIndex < idx;
        const historyData = getHistoryItem(stage.key);

        let stepClass = 'timeline-step';
        if (isCompleted) stepClass += ' completed';
        if (isCurrent) stepClass += ' current';

        const IconComponent = stage.icon;

        return (
          <div key={stage.key} className={stepClass}>
            <div className="timeline-icon-box">
              {isCompleted ? <Check size={18} strokeWidth={3} /> : <IconComponent size={18} />}
            </div>

            <div className="timeline-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span className="timeline-step-title" style={{ color: isUpcoming ? 'var(--text-light)' : 'var(--text-main)' }}>
                  {stage.title}
                </span>
                {historyData && (
                  <span className="timeline-step-time">
                    {new Date(historyData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {new Date(historyData.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              <p className="timeline-step-desc" style={{ color: isUpcoming ? 'var(--text-light)' : 'var(--text-muted)' }}>
                {historyData?.note || stage.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
