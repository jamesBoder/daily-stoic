package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/handlers"
	"github.com/jamesBoder/daily-stoic/internal/middleware"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

func SetupRoutes(
	r *gin.Engine,
	authHandler *handlers.AuthHandler,
	oauthHandler *handlers.OAuthHandler,
	quoteHandler *handlers.QuoteHandler,
	favoriteHandler *handlers.FavoriteHandler,
	historyHandler *handlers.HistoryHandler,
	commentHandler *handlers.CommentHandler,
	profileHandler *handlers.ProfileHandler,
	settingsHandler *handlers.SettingsHandler,
	subscriptionHandler *handlers.SubscriptionHandler,
	tokenService *services.TokenService,
	subscriptionRepo *repository.SubscriptionRepository,
) {
	authMW := middleware.AuthMiddleware(tokenService, subscriptionRepo)
	optionalAuthMW := middleware.OptionalAuthMiddleware(tokenService, subscriptionRepo)

	api := r.Group("/api")

	// Auth
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
		auth.GET("/me", authMW, authHandler.GetMe)
		auth.POST("/verify-email", authHandler.VerifyEmail)
		auth.POST("/resend-verification", authHandler.ResendVerification)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)
		auth.GET("/google/login", oauthHandler.GoogleLogin)
		auth.GET("/google/callback", oauthHandler.GoogleCallback)
		auth.POST("/google/link", authMW, oauthHandler.LinkGoogle)
		auth.POST("/google/unlink", authMW, oauthHandler.UnlinkGoogle)
	}

	// Quotes (optional auth — public read, streak recording when authenticated)
	quotes := api.Group("/quotes")
	quotes.Use(optionalAuthMW)
	{
		quotes.GET("/daily", quoteHandler.GetDailyQuote)
		quotes.GET("/search", quoteHandler.SearchQuotes)
		quotes.GET("/by-author/:authorId", quoteHandler.GetQuotesByAuthor)
		quotes.GET("/:id", quoteHandler.GetQuoteByID)
	}

	// Authors & Traditions (public)
	api.GET("/authors", quoteHandler.ListAuthors)
	api.GET("/traditions", quoteHandler.ListTraditions)

	// Protected routes (require auth)
	protected := api.Group("/")
	protected.Use(authMW)
	{
		// Favorites
		fav := protected.Group("favorites")
		fav.GET("", favoriteHandler.GetFavorites)
		fav.POST("", favoriteHandler.AddFavorite)
		fav.DELETE("/:id", favoriteHandler.RemoveFavorite)

		// History
		hist := protected.Group("history")
		hist.GET("", historyHandler.GetHistory)
		hist.DELETE("", historyHandler.ClearHistory)

		// Comments
		com := protected.Group("comments")
		com.POST("", commentHandler.AddOrUpdateComment)
		com.GET("/quote/:id", commentHandler.GetCommentForQuote)
		com.DELETE("/:id", commentHandler.DeleteComment)
		com.GET("/user", commentHandler.GetUserComments)

		// Profile
		profile := protected.Group("profile")
		profile.GET("", profileHandler.GetProfile)
		profile.PUT("", profileHandler.UpdateProfile)
		profile.GET("/stats", profileHandler.GetStats)
		profile.GET("/streak", profileHandler.GetUserStreak)
		profile.GET("/achievements", profileHandler.GetUserAchievements)
		profile.POST("/password/set", profileHandler.SetPassword)
		profile.PUT("/password", profileHandler.UpdatePassword)
		profile.POST("/resend-verification", profileHandler.ResendVerification)

		// Settings
		settings := protected.Group("settings")
		settings.GET("", settingsHandler.GetSettings)
		settings.PUT("", settingsHandler.UpdateSettings)
		settings.GET("/language", settingsHandler.GetLanguage)
		settings.PUT("/language", settingsHandler.UpdateLanguage)
	}

	// Subscription
	sub := api.Group("/subscription")
	{
		sub.GET("", optionalAuthMW, subscriptionHandler.GetStatus)
		sub.POST("/checkout", authMW, subscriptionHandler.CreateCheckout)
		sub.POST("/webhook", subscriptionHandler.HandleWebhook) // no auth — Stripe-signed
	}
}
