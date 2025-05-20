import cron from 'node-cron';
import * as ReminderModel from '../models/reminderModel';
import { notifyUser } from './webSocket';

const pad = (num: number) => (num < 10 ? '0' + num : num.toString());

// Array to map day number to day name
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const dayNumber = now.getDay(); // 0=Sunday to 6=Saturday
  const dayName = daysOfWeek[dayNumber]; // 0=Sunday to 6=Saturday
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:00`; // 'HH:mm:00'

  console.log(`[CRON] Checking reminders for day=${dayNumber} (${dayName}), time=${time}`);

  try {
    const dueReminders = await ReminderModel.getDueReminders(dayNumber, time);
  console.log(`[CRON] Found ${dueReminders.length} reminders`);

    for (const reminder of dueReminders) {
  
      console.log(`[CRON] Notifying user ${reminder.userid}...`);
      await notifyUser(reminder.userid, {
        activityType: reminder.activitytype,
        dayName,
        reminderTime: reminder.remindertime,
      });
      
      await ReminderModel.deleteReminder(reminder.reminderid);
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});
