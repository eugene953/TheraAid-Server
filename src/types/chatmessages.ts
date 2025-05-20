export interface ChatMessage {
    id?: number;
    user_id: number;
    message: string;
    response: string;
    session_id: number;
    timestamp?: Date;
  }
  