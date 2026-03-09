// Interfaces for managing comments on verses


export interface Comment {
  id: number;
  user_id: string;
  verse_id: number;
  verse_reference: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface AddCommentRequest {
  verse_id: number;
  verse_reference: string;
  comment_text: string;
}
