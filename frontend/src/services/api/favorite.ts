// 1. Correct imports
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import {FavoritesResponse } from '../../types/favorite';
import { AddFavoriteResponse } from '../../types/favorite';
import { showToast } from '../../utils/toast';

// init GetFavoritesParams interface
export interface GetFavoritesParams {
    page: number;
    pageSize: number;
    search?: string;
}

// 2. Service object (like commentService)
export const favoriteService = {
  
  /**
 * Fetches user's favorite verses with pagination and optional search
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page (default: 20)
 * @param search - Optional search query to filter favorites
 * @returns Promise with favorites and pagination metadata
 */
  getFavorites: async (page = 1, pageSize = 20, search?: string, lang?: string) => {
    try {
      // Calculate offset
      const params: Record<string, any> = { page, page_size: pageSize };
      if (search) params.search = search;
      if (lang && lang !== 'en') params.lang = lang;

      // API call with correct response type
      const response = await apiClient.get<FavoritesResponse>(
        API_ENDPOINTS.FAVORITES, 
        { params }
      );
      
      // Return unwrapped data
      return response.data;
      
    } catch (error: any) {
        // Log the error for debugging
        console.error('Error fetching favorites:', error); 

        // Network error (no response)
        if (!error.response) {
            showToast.error('Network error. Please check your connection.');
            throw new Error('Network error. Please check your connection.');
        }

        // Handle 404 separately if needed
        if (error.response?.status === 404) {
            return { 
                favorites: [], 
                pagination: { total: 0, page, page_size: pageSize, total_pages: 0 }
            };
        }
        
        // Server error
        if (error.response?.status === 500) {
            showToast.error('Server error. Please try again later.');
        } else {
            showToast.error('Failed to load favorites');
        }
        throw error;
    }
},

  /**
 * Adds a quote to user's favorites
 * @param quoteId - ID of the quote to favorite
 * @returns Promise with success message
 * @throws Error if quote is already favorited (409) or other errors
 */
  addFavorite: async (quoteId: number) => {
    try {
        const response = await apiClient.post<AddFavoriteResponse>(
        API_ENDPOINTS.FAVORITES, 
        { quote_id: quoteId }
        );
        showToast.success('Added to favorites!');
        return response.data; // { message: "Favorite added successfully" }
    } catch (error: any) {
      // Correct status code for conflict
      if (error.response?.status === 409) {
        showToast.error('This quote is already in your favorites');
        throw new Error('This quote is already in your favorites');
      }
      showToast.error('Failed to add favorite');
      throw error;
    }
  },

  /**
 * Removes a verse from user's favorites
 * @param favoriteId - ID of the favorite to remove
 * @throws Error if favorite not found (404) or other errors
 */
  removeFavorite: async (favoriteId: number) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.FAVORITES}/${favoriteId}`);
      showToast.success('Removed from favorites');
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast.error('Favorite not found');
        throw new Error('Favorite not found. It may have been already removed.');
      }
      showToast.error('Failed to remove favorite');
      throw error;
    }
  },

  /**
 * Checks if a quote is in user's favorites
 * @param quoteId - ID of the quote to check
 * @returns Promise<boolean> - true if favorited, false otherwise
 */
isFavorited: async (quoteId: number): Promise<boolean> => {
  try {
    const response = await favoriteService.getFavorites(1, 100); // Get first 100
    return response.favorites.some(fav => fav.quote_id === quoteId);
  } catch (error) {
    console.error('Error checking if favorited:', error);
    return false;
  }
}

};


