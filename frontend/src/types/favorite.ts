// init interfaces for favorites 
import { Quote } from "./quote";


export interface Favorite {
    id: number;
    user_id: number;
    quote_id: number;
    quote?: Quote;
    created_at: string;
    updated_at: string;
    user?: {
    id: number;
    email: string;
    username: string;
    created_at: string;
  };
}

export interface FavoritesResponse {
    favorites: Favorite[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
    }

export interface AddFavoriteRequest {
    quote_id: number;
}

export interface AddFavoriteResponse {
    message: string;
    
}

export interface RemoveFavoriteResponse {
    message: string;
}