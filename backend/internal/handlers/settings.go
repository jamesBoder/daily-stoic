package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/services"
	"net/http"
)

type SettingsHandler struct {
	settingsService *services.SettingsService
}

func NewSettingsHandler(settingsService *services.SettingsService) *SettingsHandler {
	return &SettingsHandler{
		settingsService: settingsService,
	}
}

// GetSettings retrieves user settings
func (h *SettingsHandler) GetSettings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	settings, err := h.settingsService.GetUserSettings(userID.(uint))
	if err != nil {
		// If settings don't exist, create default settings
		settings, err = h.settingsService.CreateDefaultSettings(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve or create settings"})
			return
		}
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates user settings
func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var updateRequest struct {
		PreferredLanguage  *string `json:"preferred_language"`
		EmailNotifications *bool   `json:"email_notifications"`
		DailyVerseReminder *bool   `json:"daily_verse_reminder"`
		DarkMode           *bool   `json:"dark_mode"`
	}

	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Build updates map with only non-nil values
	updates := make(map[string]interface{})
	if updateRequest.PreferredLanguage != nil {
		// Validate language code
		validLanguages := map[string]bool{
			"en": true,
			"es": true,
			"fr": true,
			"ht": true,
		}

		if !validLanguages[*updateRequest.PreferredLanguage] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid language code"})
			return
		}

		updates["preferred_language"] = *updateRequest.PreferredLanguage
	}

	if updateRequest.EmailNotifications != nil {
		updates["email_notifications"] = *updateRequest.EmailNotifications
	}

	if updateRequest.DailyVerseReminder != nil {
		updates["daily_verse_reminder"] = *updateRequest.DailyVerseReminder
	}

	if updateRequest.DarkMode != nil {
		updates["dark_mode"] = *updateRequest.DarkMode
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	settings, err := h.settingsService.UpdateUserSettings(userID.(uint), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Settings updated successfully",
		"settings": settings,
	})
}

// GetLanguage gets just the language preference
func (h *SettingsHandler) GetLanguage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	language, err := h.settingsService.GetUserLanguage(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve language preference"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"language": language})
}

// UpdateLanguage updates just the language preference
func (h *SettingsHandler) UpdateLanguage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var request struct {
		Language string `json:"language" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Language is required"})
		return
	}

	if err := h.settingsService.UpdateUserLanguage(userID.(uint), request.Language); err != nil {
		if err.Error() == "invalid language code" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update language preference"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Language preference updated successfully",
		"language": request.Language,
	})
}
