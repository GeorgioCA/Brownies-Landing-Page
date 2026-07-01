const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'subscribers.json');
const TO_EMAIL = 'contact@frontseatview.com';

app.use(express.json());

function readSubscribers() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSubscribers(subscribers) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));
}

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('EMAIL_USER or EMAIL_PASS not set — emails will not be sent');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.zohocloud.ca',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

app.post('/api/subscribe', async (req, res) => {
  const { name, email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const subscribers = readSubscribers();
  if (subscribers.some((s) => s.email === email)) {
    return res.status(409).json({ error: 'You are already on the waitlist!' });
  }

  const entry = {
    name: name.trim(),
    email,
    subscribedAt: new Date().toISOString(),
  };
  subscribers.push(entry);
  saveSubscribers(subscribers);

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: TO_EMAIL,
        subject: `New Brownies Waitlist Signup — ${name}`,
        text: `New signup!\n\nName: ${name}\nEmail: ${email}\nDate: ${entry.subscribedAt}`,
        html: `<p><strong>New Brownies Waitlist Signup</strong></p>
               <p>Name: ${name}<br>Email: ${email}<br>Date: ${entry.subscribedAt}</p>`,
      });
      console.log(`Email sent for ${email}`);
    } catch (err) {
      console.error(`SMTP error: ${err.message}`);
    }
  }

  res.status(201).json({ message: `Welcome to the waitlist, ${name}!` });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'brownies-api' });
});

app.listen(PORT, () => {
  console.log(`Brownies API running on port ${PORT}`);
});
