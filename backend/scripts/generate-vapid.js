const webpush = require('web-push');

try {
  const keys = webpush.generateVAPIDKeys();
  console.log('VAPID keys (JSON):');
  console.log(JSON.stringify(keys, null, 2));
  console.log('\nCopy the publicKey and privateKey into your backend environment.');
} catch (err) {
  console.error('Failed to generate VAPID keys', err);
  process.exit(1);
}
