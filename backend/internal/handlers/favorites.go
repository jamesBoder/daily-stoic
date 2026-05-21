package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/services"
	"github.com/jamesBoder/daily-stoic/internal/utils"
)

type FavoriteHandler struct {
	favoriteService *services.FavoriteService
}

func NewFavoriteHandler(favoriteService *services.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{favoriteService: favoriteService}
}

// GET /api/favorites
func (h *FavoriteHandler) GetFavorites(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	search := c.Query("search")

	favorites, total, err := h.favoriteService.GetUserFavoritesPaginated(userID.(uint), search, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
		return
	}

	paginationParams := utils.NewPaginationParams(page, pageSize)
	c.JSON(http.StatusOK, gin.H{
		"favorites":  favorites,
		"pagination": utils.CalculatePaginationMeta(total, paginationParams),
	})
}

// POST /api/favorites
func (h *FavoriteHandler) AddFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		QuoteID uint `json:"quote_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.favoriteService.AddFavorite(userID.(uint), req.QuoteID)
	if err != nil {
		if strings.Contains(err.Error(), "already in favorites") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite added successfully"})
}

// DELETE /api/favorites/:id
func (h *FavoriteHandler) RemoveFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid favorite ID"})
		return
	}

	if err := h.favoriteService.RemoveFavorite(userID.(uint), uint(favoriteID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite removed successfully"})
}
