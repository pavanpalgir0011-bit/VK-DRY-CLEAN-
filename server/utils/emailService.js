const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const getTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
  const secure = process.env.EMAIL_SECURE === 'false' ? false : port === 465;
  const user = (process.env.EMAIL_USER || process.env.ADMIN_EMAIL || '').trim();
  // Strip spaces if user copied Google App Password as 4 blocks of 4 chars
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // Helps avoid self-signed or proxy TLS issues
    },
  });
};

/**
 * Send instant order notification email to Admin when customer places an order
 * @param {Object} order - Full order object
 */
const sendNewOrderNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'pavanpalgir0011@gmail.com';
    const transporter = getTransporter();

    if (!transporter) {
      console.warn('⚠️ Email notification skipped: EMAIL_USER or EMAIL_PASS not set in .env');
      return { success: false, message: 'SMTP credentials not configured in .env' };
    }

    const itemsRows = (order.items || [])
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; color: #64748b; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px; font-weight: 600; color: #0f172a;">${item.name}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity} ${item.unit || 'Pc'}</td>
          <td style="padding: 10px; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; text-align: right; font-weight: 700;">₹${item.price * item.quantity}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <!-- Top banner -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">VK DRY CLEAN</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">New Doorstep Order Notification</p>
        </div>

        <div style="padding: 24px;">
          <!-- Order ID & Total highlight -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Order Reference</div>
              <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">#${order.orderId}</div>
              <div style="font-size: 12px; color: #475569;">Invoice: ${order.invoiceNumber || 'Pending'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Grand Total</div>
              <div style="font-size: 22px; font-weight: 800; color: #16a34a;">₹${order.total}</div>
              <div style="font-size: 12px; color: #0284c7;">${order.paymentMethod || 'Cash on Delivery'}</div>
            </div>
          </div>

          <!-- Customer & Logistics details -->
          <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; margin: 0 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">Customer & Pickup Details</h3>
          <table style="width: 100%; font-size: 14px; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px;">Customer Name:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${order.customer?.name || 'Customer'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Phone:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;"><a href="tel:${order.customer?.phone}" style="color: #2563eb; text-decoration: none;">${order.customer?.phone || 'N/A'}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Email:</td>
              <td style="padding: 6px 0; color: #0f172a;">${order.customer?.email || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Pickup Address:</td>
              <td style="padding: 6px 0; color: #0f172a;">${order.pickupAddress?.address}, ${order.pickupAddress?.city} — ${order.pickupAddress?.pincode} ${order.pickupAddress?.landmark ? `(Near: ${order.pickupAddress.landmark})` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Pickup Slot:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #2563eb;">${order.pickupDate} (${order.pickupTime})</td>
            </tr>
            ${order.specialInstructions ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Special Notes:</td>
              <td style="padding: 6px 0; color: #d97706; font-weight: 600;">${order.specialInstructions}</td>
            </tr>
            ` : ''}
          </table>

          <!-- Items Table -->
          <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; margin: 0 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">Garments Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 8px; width: 30px; text-align: center;">#</th>
                <th style="padding: 8px;">Service</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Rate</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Pricing summary -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
              <span>Garments Subtotal:</span>
              <span style="font-weight: 600; color: #0f172a;">₹${order.subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
              <span>Pickup & Delivery:</span>
              <span style="font-weight: 600; color: #0f172a;">${order.deliveryFee === 0 ? '<strong style="color: #16a34a;">FREE</strong>' : `₹${order.deliveryFee}`}</span>
            </div>
            ${order.gstRate > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
              <span>GST (${order.gstRate}%):</span>
              <span style="font-weight: 600; color: #0f172a;">₹${order.gstAmount || 0}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 16px; font-weight: 800; color: #1e3a8a;">
              <span>Grand Total:</span>
              <span>₹${order.total}</span>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 12px;">
            <a href="${process.env.CLIENT_URL || 'https://server-production-2c98.up.railway.app'}/admin/orders/${order.orderId}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">
              Open Order in Admin Panel &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          VK Dry Clean Automated Order Notification System<br />
          Helpline: +91 98765 43210 • Delhi, India
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"VK Dry Clean Order Desk" <${process.env.EMAIL_USER || adminEmail}>`,
      to: adminEmail,
      subject: `🚨 New Order: #${order.orderId} - ₹${order.total} (${order.customer?.name || 'Customer'})`,
      text: `New order #${order.orderId} received from ${order.customer?.name} (${order.customer?.phone}). Total: ₹${order.total}. Pickup Date: ${order.pickupDate} (${order.pickupTime}). Address: ${order.pickupAddress?.address}, ${order.pickupAddress?.city}.`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order notification email sent to ${adminEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to dispatch order email notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Tax Invoice email directly to customer upon order completion / delivery
 * @param {Object} order - Full order object
 * @param {Object} storeSettings - Live store official settings (address, phone, email, gstin)
 */
const sendCustomerInvoiceEmail = async (order, storeSettings = {}) => {
  try {
    const customerEmail = order.customer?.email;
    if (!customerEmail) {
      console.warn('⚠️ Cannot send customer invoice: Customer email not available on order', order.orderId);
      return { success: false, message: 'Customer email missing' };
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.warn('⚠️ SMTP not configured for sending customer invoice');
      return { success: false, message: 'SMTP not configured' };
    }

    const invoiceNum = order.invoiceNumber || `INV-2026-${order.orderId?.replace('VK-2026-', '') || '1001'}`;
    const invoiceDate = new Date(order.updatedAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const storeAddress = storeSettings?.storeAddress || 'Doorstep Pickup & Delivery Service across the City';
    const storePhone = storeSettings?.storePhone || '+91 98765 43210';
    const storeEmail = storeSettings?.storeEmail || process.env.EMAIL_USER || 'support@vkdryclean.com';
    const gstNumber = storeSettings?.gstNumber || '';

    const itemsRows = (order.items || [])
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; color: #64748b; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px; font-weight: 600; color: #0f172a;">${item.name}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity} ${item.unit || 'Pc'}</td>
          <td style="padding: 10px; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; text-align: right; font-weight: 700;">₹${item.price * item.quantity}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
        <!-- Top Banner -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 26px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">VK DRY CLEAN</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; letter-spacing: 0.3px;">Premium Fabric Care & Laundry Solutions</p>
        </div>

        <div style="padding: 24px;">
          <!-- Success Alert -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 20px;">✅</div>
            <div>
              <div style="font-size: 14px; font-weight: 700; color: #166534;">Your Order has been Delivered!</div>
              <div style="font-size: 12px; color: #15803d;">Thank you for choosing VK Dry Clean. Please find your official Tax Invoice attached below.</div>
            </div>
          </div>

          <!-- Invoice Header Info -->
          <table style="width: 100%; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 20px;">
            <tr>
              <td style="vertical-align: top; width: 60%;">
                <div style="font-size: 14px; font-weight: 800; color: #1e3a8a;">VK DRY CLEAN</div>
                <div style="font-size: 12px; color: #475569; margin-top: 3px; line-height: 1.4;">
                  ${storeAddress}<br />
                  Helpline: <strong>${storePhone}</strong><br />
                  Email: ${storeEmail}<br />
                  ${gstNumber ? `<strong>GSTIN: ${gstNumber}</strong>` : ''}
                </div>
              </td>
              <td style="vertical-align: top; text-align: right; width: 40%;">
                <div style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
                  TAX INVOICE
                </div>
                <div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.5;">
                  <strong>Invoice No:</strong> ${invoiceNum}<br />
                  <strong>Date:</strong> ${invoiceDate}<br />
                  <strong>Order ID:</strong> ${order.orderId}<br />
                  <span style="display: inline-block; margin-top: 4px; background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 11px;">PAID</span>
                </div>
              </td>
            </tr>
          </table>

          <!-- Customer & Delivery Details -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px;">Billed & Delivered To</div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${order.customer?.name || 'Customer'}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px;">
              Phone: ${order.customer?.phone || 'N/A'} • Email: ${customerEmail}<br />
              Delivery Address: ${order.pickupAddress?.address}, ${order.pickupAddress?.city} — ${order.pickupAddress?.pincode}
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 10px; width: 30px; text-align: center; color: #475569;">#</th>
                <th style="padding: 10px; color: #475569;">Service / Garment</th>
                <th style="padding: 10px; text-align: center; color: #475569;">Qty</th>
                <th style="padding: 10px; text-align: right; color: #475569;">Rate</th>
                <th style="padding: 10px; text-align: right; color: #475569;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Amount Breakdown -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 22px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #0f172a;">₹${order.subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
              <span>Doorstep Pickup & Delivery:</span>
              <span style="font-weight: 600; color: #0f172a;">${order.deliveryFee === 0 ? '<strong style="color: #16a34a;">FREE</strong>' : `₹${order.deliveryFee}`}</span>
            </div>
            ${order.gstRate > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
              <span>GST (${order.gstRate}%):</span>
              <span style="font-weight: 600; color: #0f172a;">₹${order.gstAmount || 0}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 17px; font-weight: 800; color: #1e3a8a;">
              <span>Total Paid:</span>
              <span style="color: #16a34a;">₹${order.total}</span>
            </div>
          </div>

          <!-- View Online Button -->
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order.orderId}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px;">
              View & Print Invoice Online &rarr;
            </a>
          </div>

          <!-- Customer Service Note -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #1e40af; line-height: 1.5;">
            <strong>Fabric Care Assurance:</strong> Every garment is sanitized with eco-safe solvents and inspected before delivery. If you have any questions or feedback regarding your order, please call us at <strong>${storePhone}</strong>.
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          VK Dry Clean • Quality You Can Wear<br />
          Helpline: ${storePhone} • Email: ${storeEmail}
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"VK Dry Clean" <${process.env.EMAIL_USER || storeEmail}>`,
      to: customerEmail,
      subject: `🧾 Tax Invoice #${invoiceNum} for Order #${order.orderId} - Delivered | VK Dry Clean`,
      text: `Dear ${order.customer?.name},\n\nYour order #${order.orderId} has been successfully completed and delivered! Total Amount Paid: ₹${order.total}.\n\nInvoice Number: ${invoiceNum}\nDate: ${invoiceDate}\nStore Helpline: ${storePhone}\n\nThank you for choosing VK Dry Clean!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Customer Invoice sent to ${customerEmail} for order #${order.orderId}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to dispatch customer invoice email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNewOrderNotification,
  sendCustomerInvoiceEmail,
  getTransporter,
};
