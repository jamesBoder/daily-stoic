package handlers

import (
	"net/http"
	"fmt"

	"os"
	"github.com/jamesBoder/daily-stoic/internal/services"
	"github.com/jamesBoder/daily-stoic/internal/utils"
	"github.com/gin-gonic/gin"

)

// OAuthHandler handles OAuth-related requests
type OAuthHandler struct {
	oauthService *services.OAuthService
}

// NewOAuthHandler creates a new instance of OAuthHandler
func NewOAuthHandler(oauthService *services.OAuthService) *OAuthHandler {
	return &OAuthHandler{
		oauthService: oauthService,
	}
}

// GoogleLogin - redirect to Google OAuth, generate state token. endpoint: /api/auth/google/login
func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
	//  Generate a random state string using crypto/rand for security
	state, err := utils.GenerateStateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate state token"})
		return
	}

	// Store state token for validation
	utils.StoreState(state)
	
	// Get Google OAuth URL
	url := h.oauthService.GetGoogleLoginURL(state)

	// Redirect to Google OAuth consent page
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback - handle Google OAuth callback. endpoint: /api/auth/google/callback
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	// Get state from query params  
	state := c.Query("state")
	code := c.Query("code")

	// Validate state token
	if !utils.ValidateState(state) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired state token"})
		return
	}

	// Get code from query params
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found in callback"})
		return
	}

	// Handle Google OAuth callback
	_, token, err := h.oauthService.HandleGoogleCallback(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle Google callback: " + err.Error()})
		return
	}

	// Get frontend URL from environment variables
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // default to localhost if not set
	}

	// Redirect to frontend with token
	redirectURL := fmt.Sprintf("%s/auth/google/callback?token=%s", frontendURL, token)
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// LinkGoogle - link Google account to existing user. endpoint: /api/auth/google/link requires authentication
func (h *OAuthHandler) LinkGoogle(c *gin.Context) {
	// Get authenticated user ID from context 
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get Google authorization code from request body
	var req struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Exchange code for Google user info
	googleUser, _, err := h.oauthService.HandleGoogleCallback(req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get Google user info: " + err.Error()})
		return
	}

	// Link Google account to the authenticated user
	err = h.oauthService.LinkGoogleAccount(
		userID.(uint), 
		getStringValue(googleUser.GoogleID), 
		getStringValue(googleUser.GoogleEmail), 
		getStringValue(googleUser.GooglePicture),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link Google account: " + err.Error()})
		return
	}

	// Return success response JSON
	c.JSON(http.StatusOK, gin.H{
		"message": "Google account linked successfully",
		"user":    googleUser,
	})
}

// UnlinkGoogle - unlink Google account from existing user. endpoint: /api/auth/google/unlink requires authentication
func (h *OAuthHandler) UnlinkGoogle(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Unlink Google account
	if err := h.oauthService.UnlinkGoogleAccount(userID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlink Google account: " + err.Error()})
		return
	}

	// Return success response JSON
	c.JSON(http.StatusOK, gin.H{
		"message": "Google account unlinked successfully",
	})
}

