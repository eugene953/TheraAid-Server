import { Request, Response } from 'express';
import * as ReminderModel from '../models/reminderModel';
import pool from '../config/database';

export const createReminder = async (req: Request, res: Response) => {
  try {
    const { userID, activityType, reminders } = req.body;

    if (
      !userID ||
      !activityType ||
      !Array.isArray(reminders) ||
      reminders.length === 0
    ) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const createdReminders = [];

    for (const rem of reminders) {
      const created = await ReminderModel.createReminder({
        userID,
        activityType,
        reminderDay: rem.reminderDay,
        reminderTime: rem.reminderTime,
      });

      // Convert numeric reminderDay to string day
      created.reminderDay = daysOfWeek[parseInt(rem.reminderDay)];

      createdReminders.push(created);
    }

    res.status(201).json(createdReminders);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reminders', error });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  const { reminderID } = req.params;

  try {
    await pool.query(`DELETE FROM Reminders WHERE reminderID = $1`, [
      reminderID,
    ]);

    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
