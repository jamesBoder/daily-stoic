package utils

// helper functions for pagination

import (
	"math"
)

// init PaginationParams Struct
type PaginationParams struct {
	Page     int
	PageSize int
}

// PaginationMeta holds pagination metadata
type PaginationMeta struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// NewPaginationParams creates a new PaginationParams with default values
func NewPaginationParams(page, pageSize int) PaginationParams {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return PaginationParams{
		Page:     page,
		PageSize: pageSize,
	}
}

// CalculatePaginationMeta calculates pagination metadata
func CalculatePaginationMeta(total int64, params PaginationParams) PaginationMeta {
	totalPages := int(math.Ceil(float64(total) / float64(params.PageSize)))
	return PaginationMeta{
		Page:       params.Page,
		PageSize:   params.PageSize,
		Total:      total,
		TotalPages: totalPages,
	}
}
