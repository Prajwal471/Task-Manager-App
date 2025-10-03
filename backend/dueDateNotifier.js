// Scheduled job to notify users about tasks nearing due date
const cron = require('node-cron');
const TaskModel = require('./Models/TaskModel');
const UserModel = require('./Models/User');
const { sendNotification } = require('./utils/notification');

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next 24 hours
    const tasks = await TaskModel.find({
      dueDate: { $lte: soon, $gte: now },
      isDone: false
    });
    for (const task of tasks) {
      const user = await UserModel.findById(task.userId);
      if (user && user.email) {
        sendNotification(user.email, 'Task Due Soon', `Your task "${task.taskName}" is due soon!`);
      }
    }
  } catch (err) {
    console.error('Due date notification error:', err);
  }
});
