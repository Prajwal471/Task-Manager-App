// Email notification utility using Nodemailer. Falls back to console log if SMTP is not configured.
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  // Only create transporter if core SMTP settings are present
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

async function sendNotification(email, subject, message, html) {
  try {
    const tx = getTransporter();
    const from = process.env.NOTIFY_FROM || 'no-reply@taskflow.local';

    if (!tx) {
      // Fallback: console log
      console.log(`Notify ${email}: ${subject} - ${message}`);
      return { queued: false, delivered: false, method: 'console' };
    }

    await tx.sendMail({
      from,
      to: email,
      subject,
      text: message,
      html: html || `<p>${message}</p>`
    });

    return { queued: true, delivered: true, method: 'smtp' };
  } catch (err) {
    console.error('[Notification] Failed to send email:', err);
    // Fallback log so the event isn’t lost entirely
    console.log(`Notify ${email}: ${subject} - ${message}`);
    return { queued: false, delivered: false, method: 'console-fallback', error: err?.message };
  }
}

// Web Push notifications (device/browser)
const webPush = require('web-push');

function configureWebPush() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      webPush.setVapidDetails(
        VAPID_SUBJECT || 'mailto:no-reply@taskflow.local',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      );
      return true;
    } catch (e) {
      console.error('[Notification] VAPID configuration error:', e);
      return false;
    }
  }
  return false;
}

async function sendPushNotification(user, title, body) {
  try {
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return { delivered: false, reason: 'no-subscriptions' };
    }
    const configured = configureWebPush();
    if (!configured) {
      return { delivered: false, reason: 'vapid-not-configured' };
    }

    const payload = JSON.stringify({ title, body });

    const results = await Promise.allSettled(
      user.pushSubscriptions.map((sub) =>
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        )
      )
    );

    return { delivered: true, results };
  } catch (err) {
    console.error('[Notification] Failed to send push:', err);
    return { delivered: false, error: err?.message };
  }
}

module.exports = { sendNotification, sendPushNotification };
