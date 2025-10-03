// Simple notification utility (console log)
// Extendable to email, push, etc.

function sendNotification(email, subject, message) {
  // Replace with email/push logic as needed
  console.log(`Notify ${email}: ${subject} - ${message}`);
}

module.exports = { sendNotification };