const nodemailer = require('nodemailer');
const { buildAddress } = require('./addressUtils');

let cachedTransporter = null;

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (isMailConfigured()) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return cachedTransporter;
}

function orderText(order, user) {
  const address = buildAddress(order.shippingAddress || {});
  const itemLines = (order.items || []).map((item) => `- ${item.name || 'Item'} x${item.quantity || 1} (${item.size || 'Standard'}, ${item.color || 'Default'})`).join('\n');
  return [
    `Hello ${user?.name || 'Customer'},`,
    '',
    `Your order ${order._id} has been placed successfully.`,
    `Total: ${order.total || 0}`,
    `Payment method: ${String(order.paymentMethod || 'cod').toUpperCase()}`,
    `Payment status: ${order.paymentStatus || 'pending'}`,
    '',
    'Items:',
    itemLines || '- No items listed',
    '',
    'Shipping address:',
    `${address.name || ''}`,
    `${address.phone || ''}`,
    `${address.address || ''}`,
    `${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}`,
    '',
    'Thank you for shopping with NovaMart.',
  ].join('\n');
}

async function sendOrderConfirmationEmail(user, order) {
  if (!user?.email) return null;
  const transporter = getTransporter();
  const subject = `Order confirmation ${order._id}`;
  const text = orderText(order, user);
  const html = text.replace(/\n/g, '<br />');
  const result = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@novamart.local',
    to: user.email,
    subject,
    text,
    html,
  });
  if (!isMailConfigured()) {
    console.warn(`Order email preview for ${user.email}: ${JSON.stringify({ subject, text })}`);
  }
  return result;
}

module.exports = {
  sendOrderConfirmationEmail,
};
