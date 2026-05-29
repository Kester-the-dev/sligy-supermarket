require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const products = require('./data/products.json');

const app = express();
const PORT = process.env.PORT || 5000;

const useSmtp = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport(
  useSmtp
    ? {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }
    : {
      sendmail: true,
      newline: 'unix',
      path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
    }
);

transporter.verify().then(() => {
  console.log('Mail transport ready:', useSmtp ? 'SMTP' : 'sendmail');
}).catch(error => {
  console.warn('Mail transport verify failed:', error.message || error);
});

async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || 'no-reply@sligy.com';
  return transporter.sendMail({ from, to, subject, text, html });
}

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sligy E-commerce API' });
});

// Products route
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/auth/welcome', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const subject = 'Welcome to Sligy!';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a3a52;">
      <h2>Welcome to Sligy, ${name}!</h2>
      <p>Your account is ready. Start shopping premium groceries, gadgets, and lifestyle products.</p>
      <p><strong>Login now</strong> to explore exclusive offers and track your orders.</p>
      <p style="margin-top: 1rem; color: #666;">– The Sligy Team</p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject, html, text: `Welcome to Sligy, ${name}! Your account is ready.` });
    return res.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(500).json({ error: 'Unable to send welcome email' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const subject = 'Sligy Password Reset Instructions';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a3a52;">
      <h2>Password reset request</h2>
      <p>We received a request to reset the password for your Sligy account.</p>
      <p>To reset your password, please use the password reset feature in the app.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p style="margin-top: 1rem; color: #666;">– The Sligy Team</p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject, html, text: 'We received a request to reset your Sligy password.' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Forgot password email error:', error);
    return res.status(500).json({ error: 'Unable to send password reset email' });
  }
});

app.post('/api/auth/order-confirmation', async (req, res) => {
  const { email, order } = req.body;
  if (!email || !order) {
    return res.status(400).json({ error: 'Email and order details are required' });
  }

  const itemsHtml = order.items.map(item => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('');
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a3a52;">
      <h2>Order confirmed!</h2>
      <p>Thank you for your purchase. Here are the details of your order:</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> $${order.total}</p>
      <p>We will notify you once your items are on the way.</p>
      <p style="margin-top: 1rem; color: #666;">– The Sligy Team</p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject: 'Your Sligy Order Confirmation', html, text: `Your order ${order.id} is confirmed. Total: $${order.total}` });
    return res.json({ success: true });
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return res.status(500).json({ error: 'Unable to send order confirmation email' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});