// Interfaces for managing comments on quotes


export interface Comment {
  id: number;
  user_id: string;
  quote_id: number;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface AddCommentRequest {
  quote_id: number;
  comment_text: string;
}
