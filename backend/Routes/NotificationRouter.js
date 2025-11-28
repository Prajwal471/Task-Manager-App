const router = require('express').Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const UserModel = require('../Models/User');

// Returns the VAPID public key so the frontend can subscribe to push
router.get('/public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY || null;
  return res.status(200).json({ publicKey: key, configured: !!key });
});

// Save a push subscription for the authenticated user
router.post('/subscribe', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { endpoint, keys, userAgent } = req.body || {};

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: 'Invalid subscription payload', success: false });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated', success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found', success: false });

    user.pushSubscriptions = user.pushSubscriptions || [];
    const exists = user.pushSubscriptions.some((s) => s.endpoint === endpoint);

    if (!exists) {
      user.pushSubscriptions.push({ endpoint, keys, userAgent });
      await user.save();
    }

    return res.status(200).json({
      message: exists ? 'Already subscribed' : 'Subscribed successfully',
      success: true
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ message: 'Failed to subscribe', success: false });
  }
});

// Remove a push subscription for the authenticated user
router.delete('/unsubscribe', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { endpoint } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required', success: false });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated', success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found', success: false });

    const before = (user.pushSubscriptions || []).length;
    user.pushSubscriptions = (user.pushSubscriptions || []).filter((s) => s.endpoint !== endpoint);
    const after = user.pushSubscriptions.length;
    if (after !== before) {
      await user.save();
    }

    return res.status(200).json({
      message: after !== before ? 'Unsubscribed successfully' : 'Subscription not found',
      success: true
    });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return res.status(500).json({ message: 'Failed to unsubscribe', success: false });
  }
});

module.exports = router;

// Test endpoint: POST /notifications/test
// Body: { userId?: string, title: string, message: string }
router.post('/test', async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'title and message required', success: false });

    const uid = userId;
    const user = uid ? await UserModel.findById(uid) : null;
    if (!user) return res.status(404).json({ message: 'User not found', success: false });

    const { sendNotification, sendPushNotification } = require('../utils/notification');
    // send email (or console fallback)
    await sendNotification(user.email, title, message);
    // send push if available
    try { await sendPushNotification(user, title, message); } catch (e) { console.error('Push test failed', e); }

    return res.status(200).json({ message: 'Test notification sent (or logged)', success: true });
  } catch (err) {
    console.error('Test notify error:', err);
    return res.status(500).json({ message: 'Failed to send test notification', success: false, error: err.message });
  }
});
