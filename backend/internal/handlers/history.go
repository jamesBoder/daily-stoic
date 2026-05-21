package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

type HistoryHandler struct {
	historyService *services.HistoryService
}

func NewHistoryHandler(historyService *services.HistoryService) *HistoryHandler {
	return &HistoryHandler{historyService: historyService}
}

// GET /api/history
func (h *HistoryHandler) GetHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	history, total, err := h.historyService.GetUserHistoryPaginated(userID.(uint), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}

	totalPages := (int(total) + pageSize - 1) / pageSize
	c.JSON(http.StatusOK, gin.H{
		"history": history,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// DELETE /api/history
func (h *HistoryHandler) ClearHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.historyService.ClearHistory(userID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "History cleared successfully"})
}
