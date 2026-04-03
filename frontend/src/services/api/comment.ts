import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { Comment, AddCommentRequest } from '../../types/comment';
import { showToast } from '../../utils/toast';

export const commentService = {
  // Add or update comment
  addOrUpdateComment: async (data: AddCommentRequest): Promise<Comment> => {
    try {
      const response = await apiClient.post<{ comment: Comment }>(
        API_ENDPOINTS.COMMENTS,
        data
      );
      showToast.success('Comment saved!');
      return response.data.comment;
    } catch (error: any) {
      if (error.response?.status === 400) {
        showToast.error('Invalid comment data');
      } else if (error.response?.status === 413) {
        showToast.error('Comment is too long (max 1000 characters)');
      } else {
        showToast.error('Failed to save comment');
      }
      throw error;
    }
  },

  // Get comment for specific quote
  getCommentForQuote: async (quoteId: number): Promise<Comment | null> => {
    try {
      const response = await apiClient.get<{ comment: Comment }>(
        `${API_ENDPOINTS.COMMENTS}/quote/${quoteId}`
      );
      return response.data.comment;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get comment for specific verse
  getCommentForVerse: async (verseReference: string): Promise<Comment | null> => {
    try {
      const response = await apiClient.get<{ comment: Comment }>(
        `${API_ENDPOINTS.COMMENTS}/verse/${encodeURIComponent(verseReference)}`
      );
      return response.data.comment;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`);
      showToast.success('Comment deleted!');
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast.error('Comment not found');
      } else {
        showToast.error('Failed to delete comment');
      }
      throw error;
    }
  },

  // Get all user comments
  getUserComments: async (): Promise<Comment[]> => {
    try {
      const response = await apiClient.get<{ comments: Comment[] }>(
        `${API_ENDPOINTS.COMMENTS}/user`
      );
      return response.data.comments;
    } catch (error: any) {
      showToast.error('Failed to load comments');
      throw error;
    }
  },
};
