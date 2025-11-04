require('dotenv').config();
const { connectDB } = require('../Models/db');
const User = require('../Models/User');

async function run() {
  try {
    await connectDB({ retries: 1, delayMs: 1000 });
    const user = await User.findOne({ 'pushSubscriptions.0': { $exists: true } }).lean();
    if (!user) {
      console.log('NO_SUBSCRIBED_USER');
      process.exit(0);
    }
    console.log(JSON.stringify({ _id: user._id, email: user.email, subsCount: user.pushSubscriptions.length }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exit(2);
  }
}

run();
