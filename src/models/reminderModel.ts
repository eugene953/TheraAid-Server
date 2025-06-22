import pool from '../config/database';
import { ReminderInput } from '../types/reminderTypes';

export const createReminder = async (reminder: ReminderInput) => {
  const { userID, activityType, reminderDay, reminderTime } = reminder;
  const result = await pool.query(
    `INSERT INTO Reminders (userID, activityType, reminderDay, reminderTime)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [userID, activityType, reminderDay, reminderTime]
  );
  return result.rows[0];
};

//fetch reminders that are due on current day and time (exact match to time)
export const getDueReminders = async (day: number, time: string) => {
  const result = await pool.query(
    `SELECT * FROM Reminders
       WHERE reminderDay = $1 AND reminderTime = $2`,
    [day, time]
  );
  return result.rows;
};

export const deleteReminder = async (reminderID: number) => {
  await pool.query(`DELETE FROM Reminders WHERE reminderID = $1`, [reminderID]);
};
