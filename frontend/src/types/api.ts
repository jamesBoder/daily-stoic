

// Define a generic API response structure
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}


// Define pagination metadata
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// Define a paginated response structure
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}