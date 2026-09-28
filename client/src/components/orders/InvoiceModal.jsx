import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, Sparkles, CheckCircle2, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import { settingsAPI, ordersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Number to Words converter for Indian Rupees
const numberToWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n === 0) return 'Zero';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '')
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        ' Thousand' +
        (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '')
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        ' Lakh' +
        (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '')
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      ' Crore' +
      (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '')
    );
  };

  const amount = Math.round(Number(num) || 0);
  return `${inWords(amount)} Rupees Only`;
};

const InvoiceModal = ({ order, isOpen, onClose }) => {
  const invoiceRef = useRef(null);
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;
    settingsAPI
      .getPublicSettings()
      .then((res) => {
        if (isMounted && res.success && res.settings) {
          setStoreSettings(res.settings);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const { addToast } = useToast();
  const [emailing, setEmailing] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = async () => {
    if (!order) return;
    setEmailing(true);
    try {
      const res = await ordersAPI.sendCustomerInvoice(order.orderId);
      if (res.success) {
        addToast(res.message || `Tax Invoice sent to ${order.customer?.email} successfully!`, 'success');
      }
    } catch (err) {
      console.error('Invoice email error:', err);
      addToast(err.message || 'Failed to send invoice email.', 'error');
    } finally {
      setEmailing(false);
    }
  };

  const invoiceNum = order.invoiceNumber || `INV-2026-${order.orderId?.replace('VK-2026-', '') || '1001'}`;
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  const gstRate = Number(order.gstRate) || 5;
  const halfRate = (gstRate / 2).toFixed(1).replace('.0', '');
  const halfGstAmount = Math.round((order.gstAmount || 0) / 2);
  const remainingGstAmount = (order.gstAmount || 0) - halfGstAmount;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-container">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="invoice-modal-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span>Tax Invoice #{invoiceNum}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleEmailInvoice}
              disabled={emailing}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title={`Send PDF & HTML Invoice to ${order.customer?.email || 'customer email'}`}
            >
              <Mail size={15} />
              <span>{emailing ? 'Sending...' : 'Email Invoice'}</span>
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '0.4rem 0.6rem' }} aria-label="Close invoice">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="invoice-sheet" ref={invoiceRef}>
          {/* Header Row */}
          <div className="invoice-header">
            <div>
              <div className="invoice-brand-title">VK DRY CLEAN</div>
              <div className="invoice-brand-tagline">Premium Fabric Care & Laundry Solutions</div>
              <div className="invoice-store-address">
                {storeSettings?.storeAddress ? (
                  <>
                    <span>{storeSettings.storeAddress}</span>
                    <br />
                  </>
                ) : (
                  <>
                    <span>Doorstep Pickup & Delivery Service</span>
                    <br />
                  </>
                )}
                Helpline: {storeSettings?.storePhone || '+91 98765 43210'} | Email: {storeSettings?.storeEmail || 'support@vkdryclean.com'}
                {storeSettings?.gstNumber ? (
                  <>
                    <br />
                    <strong>GSTIN: {storeSettings.gstNumber}</strong>
                  </>
                ) : null}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="invoice-badge-title">TAX INVOICE</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Original for Recipient</div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                <div><strong>Invoice No:</strong> {invoiceNum}</div>
                <div><strong>Date:</strong> {invoiceDate}</div>
                <div><strong>Order ID:</strong> {order.orderId}</div>
                <div><strong>Payment:</strong> {order.paymentMethod || 'Cash on Delivery'}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7',
                      color: order.paymentStatus === 'Paid' ? '#15803d' : '#b45309',
                    }}
                  >
                    STATUS: {order.paymentStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="invoice-customer-grid">
            <div className="invoice-customer-card">
              <div className="invoice-section-heading">Billed & Delivered To</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                {order.customer?.name || 'Valued Customer'}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>
                Phone: {order.customer?.phone || 'N/A'}<br />
                Email: {order.customer?.email || 'N/A'}<br />
                Address: {order.pickupAddress?.address}, {order.pickupAddress?.city} — {order.pickupAddress?.pincode}
                {order.pickupAddress?.landmark ? ` (Near: ${order.pickupAddress.landmark})` : ''}
              </div>
            </div>

            <div className="invoice-customer-card">
              <div className="invoice-section-heading">Pickup & Delivery Logistics</div>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                <div><strong>Service Status:</strong> {order.status}</div>
                <div><strong>Scheduled Date:</strong> {order.pickupDate || 'N/A'}</div>
                <div><strong>Time Slot:</strong> {order.pickupTime || 'N/A'}</div>
                <div><strong>Special Notes:</strong> {order.specialInstructions || 'Standard garment handling'}</div>
              </div>
            </div>
          </div>

          {/* Itemized Garments Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th>Service / Garment Description</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Unit</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Deep Fabric Sanitization Included</div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>{item.unit || 'Piece'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Tax Breakdown */}
          <div className="invoice-totals-wrapper">
            <div className="invoice-words-box">
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                Invoice Amount in Words:
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', fontStyle: 'italic' }}>
                {numberToWords(order.total)}
              </div>
              <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                <strong>Bank / UPI Details:</strong><br />
                A/C Name: VK DRY CLEAN SERVICES<br />
                Bank: HDFC Bank, Connaught Place Branch<br />
                UPI ID: vkdryclean@hdfcbank
              </div>
            </div>

            <div className="invoice-amounts-card">
              <div className="invoice-row">
                <span>Subtotal (Garment Care):</span>
                <span style={{ fontWeight: 600 }}>₹{order.subtotal}</span>
              </div>

              <div className="invoice-row">
                <span>Doorstep Pickup & Delivery:</span>
                <span>
                  {order.deliveryFee === 0 ? (
                    <strong style={{ color: '#16a34a' }}>FREE</strong>
                  ) : (
                    `₹${order.deliveryFee}`
                  )}
                </span>
              </div>

              {gstRate > 0 && (
                <>
                  <div className="invoice-row" style={{ color: '#475569', fontSize: '0.85rem' }}>
                    <span>CGST ({halfRate}%):</span>
                    <span>₹{halfGstAmount}</span>
                  </div>
                  <div className="invoice-row" style={{ color: '#475569', fontSize: '0.85rem' }}>
                    <span>SGST ({halfRate}%):</span>
                    <span>₹{remainingGstAmount}</span>
                  </div>
                </>
              )}

              <div className="invoice-row invoice-grand-total">
                <span>Total Amount:</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatures */}
          <div className="invoice-footer">
            <div style={{ flex: 1, paddingRight: '2rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Terms & Conditions
              </div>
              <ol style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                <li>Please verify garments and count at the time of delivery.</li>
                <li>VK Dry Clean is not liable for color bleed due to manufacturer defect.</li>
                <li>Any discrepancies must be reported within 24 hours of delivery.</li>
                <li>This is a computer generated invoice and requires no physical seal.</li>
              </ol>
            </div>

            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: 'var(--primary)', opacity: 0.8 }}>
                  VK Dry Clean
                </span>
              </div>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                For VK DRY CLEAN
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
