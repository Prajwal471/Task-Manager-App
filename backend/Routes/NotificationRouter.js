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
    const userId = req.user._id;
    const { endpoint, keys, userAgent } = req.body || {};

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: 'Invalid subscription payload', success: false });
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
    const userId = req.user._id;
    const { endpoint } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required', success: false });
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
