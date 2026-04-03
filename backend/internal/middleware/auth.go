package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

// resolveSubscription checks the user's tier and sets "isPremium" in context.
// Called after userID is confirmed. Fails open — a DB error means isPremium=false.
func resolveSubscription(c *gin.Context, userID uint, subscriptionRepo *repository.SubscriptionRepository) {
	if subscriptionRepo == nil {
		c.Set("isPremium", false)
		return
	}
	sub, err := subscriptionRepo.GetByUserID(userID)
	if err != nil {
		c.Set("isPremium", false)
		return
	}
	c.Set("isPremium", sub.Tier == "lifetime")
}

func AuthMiddleware(tokenService *services.TokenService, subscriptionRepo ...*repository.SubscriptionRepository) gin.HandlerFunc {
	var subRepo *repository.SubscriptionRepository
	if len(subscriptionRepo) > 0 {
		subRepo = subscriptionRepo[0]
	}
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		authHeader = strings.TrimSpace(authHeader)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}
		token = strings.TrimSpace(token)

		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		c.Set("userID", claims.UserID)
		resolveSubscription(c, claims.UserID, subRepo)
		c.Next()
	}
}

// OptionalAuthMiddleware validates authentication if token is present, but doesn't require it.
// If authenticated, sets userID and isPremium in context.
func OptionalAuthMiddleware(tokenService *services.TokenService, subscriptionRepo ...*repository.SubscriptionRepository) gin.HandlerFunc {
	var subRepo *repository.SubscriptionRepository
	if len(subscriptionRepo) > 0 {
		subRepo = subscriptionRepo[0]
	}
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Set("isPremium", false)
			c.Next()
			return
		}

		authHeader = strings.TrimSpace(authHeader)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader || token == "" {
			c.Set("isPremium", false)
			c.Next()
			return
		}
		token = strings.TrimSpace(token)

		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			c.Set("isPremium", false)
			c.Next()
			return
		}

		c.Set("userID", claims.UserID)
		resolveSubscription(c, claims.UserID, subRepo)
		c.Next()
	}
}
