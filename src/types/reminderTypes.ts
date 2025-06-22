export interface ReminderInput {
  userID: number;
  activityType: string;
  reminderDay: number; // 0 to 6 (Sunday to Saturday)
  reminderTime: string; // 'HH:mm:ss' format for TIME column
}
