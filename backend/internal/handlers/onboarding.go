package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

type OnboardingHandler struct {
	settingsService *services.SettingsService
}

func NewOnboardingHandler(settingsService *services.SettingsService) *OnboardingHandler {
	return &OnboardingHandler{settingsService: settingsService}
}

type OnboardingRequest struct {
	Traditions         []string `json:"traditions"`
	Goals              []string `json:"goals"`
	DailyReminder      bool     `json:"daily_reminder"`
	EmailNotifications bool     `json:"email_notifications"`
}

// CompleteOnboarding saves the user's onboarding preferences and marks it done.
func (h *OnboardingHandler) CompleteOnboarding(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if req.Traditions == nil {
		req.Traditions = []string{}
	}
	if req.Goals == nil {
		req.Goals = []string{}
	}

	updates := map[string]interface{}{
		"onboarding_completed": true,
		"preferred_traditions": req.Traditions,
		"preferred_goals":      req.Goals,
		"daily_verse_reminder": req.DailyReminder,
		"email_notifications":  req.EmailNotifications,
	}

	settings, err := h.settingsService.UpdateUserSettings(userID.(uint), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save onboarding preferences"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Onboarding complete",
		"settings": settings,
	})
}

// ResetOnboarding clears onboarding_completed so the user can redo the flow from Settings.
func (h *OnboardingHandler) ResetOnboarding(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	updates := map[string]interface{}{
		"onboarding_completed": false,
	}

	if _, err := h.settingsService.UpdateUserSettings(userID.(uint), updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset onboarding"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Onboarding reset"})
}
