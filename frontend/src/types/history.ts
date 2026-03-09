// init types for history

// imports
import { Quote } from "./quote";

export interface HistoryResponse {
    history: HistoryEntry[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}

export interface HistoryEntry {
    id: string;
    user_id: number;
    quote_id: number;
    quote: Quote;
    viewed_at: string;
    created_at: string;
}

export interface ClearHistoryResponse {
    message: string;
}

export interface AddHistoryEntryRequest {
    quote_id: number;
}

export interface AddHistoryEntryResponse {
    message: string;
}

export interface RemoveHistoryEntryResponse {
    message: string;
}

export interface RemoveHistoryEntryRequest {
    entry_id: string;
}