"use strict";

const TaskModel = require('./Models/TaskModel');
const UserModel = require('./Models/User');
const { sendNotification } = require('./utils/notification');

// Configuration
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const UPCOMING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Basic in-memory de-duplication to avoid spamming on each interval
// Key format examples:
//  - `${taskId}:upcoming:${bucket}`
//  - `${taskId}:overdue:${bucket}`
const notified = new Set();

function getBucket(date, bucketMs) {
  const ts = Math.floor(new Date(date).getTime() / bucketMs);
  return ts;
}

async function checkDueDates() {
  try {
    const now = new Date();
    const upcomingUntil = new Date(now.getTime() + UPCOMING_WINDOW_MS);

    // Upcoming (due within next 24h) and not done
    const upcomingTasks = await TaskModel.find({
      isDone: false,
      dueDate: { $gte: now, $lte: upcomingUntil },
    }).populate('userId', 'email name');

    for (const task of upcomingTasks) {
      const bucket = getBucket(task.dueDate, UPCOMING_WINDOW_MS);
      const key = `${task._id}:upcoming:${bucket}`;
      if (notified.has(key)) continue;

      const user = task.userId && (task.userId.email ? task.userId : await UserModel.findById(task.userId));
      if (user && user.email && user.preferences?.emailNotifications !== false) {
        const dueInHours = Math.max(1, Math.round((new Date(task.dueDate).getTime() - now.getTime()) / (60 * 60 * 1000)));
        sendNotification(
          user.email,
          'Task Due Soon',
          `"${task.taskName}" is due in ~${dueInHours} hour(s).`
        );
        try {
          const { sendPushNotification } = require('./utils/notification');
          sendPushNotification(user, 'Task Due Soon', `"${task.taskName}" is due in ~${dueInHours} hour(s).`);
        } catch (_) {}
        notified.add(key);
      }
    }

    // Overdue (past due) and not done
    const overdueTasks = await TaskModel.find({
      isDone: false,
      dueDate: { $lt: now },
    }).populate('userId', 'email name');

    for (const task of overdueTasks) {
      // Use hourly buckets for overdue to avoid flooding but allow periodic reminders
      const hourlyBucket = getBucket(now, 60 * 60 * 1000);
      const key = `${task._id}:overdue:${hourlyBucket}`;
      if (notified.has(key)) continue;

      const user = task.userId && (task.userId.email ? task.userId : await UserModel.findById(task.userId));
      if (user && user.email && user.preferences?.emailNotifications !== false) {
        const overdueByHours = Math.max(1, Math.round((now.getTime() - new Date(task.dueDate).getTime()) / (60 * 60 * 1000)));
        sendNotification(
          user.email,
          'Task Overdue',
          `"${task.taskName}" is overdue by ~${overdueByHours} hour(s).`
        );
        try {
          const { sendPushNotification } = require('./utils/notification');
          sendPushNotification(user, 'Task Overdue', `"${task.taskName}" is overdue by ~${overdueByHours} hour(s).`);
        } catch (_) {}
        notified.add(key);
      }
    }
  } catch (err) {
    console.error('[DueDateNotifier] Error checking due dates:', err);
  }
}

function startScheduler() {
  console.log(`[DueDateNotifier] Starting with interval ${CHECK_INTERVAL_MS / 60000} min, window ${UPCOMING_WINDOW_MS / 3600000} h`);
  // Initial run with slight delay to ensure DB is ready
  setTimeout(checkDueDates, 5 * 1000);
  setInterval(checkDueDates, CHECK_INTERVAL_MS);
}

let intervalHandle = null;

function startScheduler() {
  if (intervalHandle) return;
  console.log(`[DueDateNotifier] Starting with interval ${CHECK_INTERVAL_MS / 60000} min, window ${UPCOMING_WINDOW_MS / 3600000} h`);
  // Initial run with slight delay to ensure DB is ready
  setTimeout(checkDueDates, 5 * 1000);
  intervalHandle = setInterval(checkDueDates, CHECK_INTERVAL_MS);
}

function stopScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = { startScheduler, stopScheduler };
