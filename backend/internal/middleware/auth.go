package middleware

import (
	"net/http"
	"strings"

	"github.com/jamesBoder/daily-stoic/internal/services"
	"github.com/gin-gonic/gin"
	
)

func AuthMiddleware(tokenService *services.TokenService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Trim spaces and strip "Bearer " prefix
		authHeader = strings.TrimSpace(authHeader)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}
		
		// Trim any remaining spaces from the token
		token = strings.TrimSpace(token)

		// validate token using TokenService
		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// store user ID in Gin context
		c.Set("userID", claims.UserID)

		c.Next()
	}
}

// OptionalAuthMiddleware validates authentication if token is present, but doesn't require it
// This allows endpoints to work for both authenticated and anonymous users
// If authenticated, userID will be set in context for features like history tracking
func OptionalAuthMiddleware(tokenService *services.TokenService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract token from Authorization header
		authHeader := c.GetHeader("Authorization")
		
		// If no auth header, continue without authentication
		if authHeader == "" {
			c.Next()
			return
		}

		// Trim spaces and strip "Bearer " prefix
		authHeader = strings.TrimSpace(authHeader)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		// If token format is invalid, continue without authentication
		if token == authHeader || token == "" {
			c.Next()
			return
		}
		
		// Trim any remaining spaces from the token
		token = strings.TrimSpace(token)

		// Validate token using TokenService
		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			// If token is invalid, continue without authentication
			// Don't abort the request - just don't set userID
			c.Next()
			return
		}

		// Store user ID in Gin context for authenticated requests
		c.Set("userID", claims.UserID)

		c.Next()
	}
}
