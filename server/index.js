require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const products = require('./data/products.json');

const app = express();
const PORT = process.env.PORT || 5000;

let transporter;
let isEthereal = false;

async function initTransporter() {
  const hasSmtp = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

  if (hasSmtp) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log('Mail transport ready: SMTP');
      return;
    } catch (error) {
      console.warn('SMTP verify failed:', error.message || error);
      console.warn('Falling back to Ethereal test account for email delivery.');
    }
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  isEthereal = true;
  console.log('Mail transport ready: Ethereal test account');
  console.log('Ethereal account user:', testAccount.user);
  console.log('Ethereal account pass:', testAccount.pass);
}

async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || 'no-reply@sligy.com';
  const info = await transporter.sendMail({ from, to, subject, text, html });
  const previewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : null;

  if (previewUrl) {
    console.log('Preview email URL:', previewUrl);
  }

  return { info, previewUrl };
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/api', (req, res) => {
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
    const { previewUrl } = await sendEmail({ to: email, subject, html, text: `Welcome to Sligy, ${name}! Your account is ready.` });
    return res.json({ success: true, previewUrl });
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

// Contact form endpoint - sends message to configured CONTACT_EMAIL
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  const to = process.env.CONTACT_EMAIL || 'godspower1326@gmail.com';
  const subject = `New contact message from ${name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a3a52;">
      <h3>Contact message from ${name} &lt;${email}&gt;</h3>
      <p>${message.replace(/\n/g, '<br/>')}</p>
      <p style="margin-top:1rem;color:#666;">— Sligy Contact Form</p>
    </div>
  `;

  try {
    const { previewUrl } = await sendEmail({ to, subject, html, text: `${name} <${email}> says: ${message}` });
    return res.json({ success: true, previewUrl });
  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(500).json({ error: 'Unable to send contact message' });
  }
});

// Start server
async function startServer() {
  await initTransporter();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
});