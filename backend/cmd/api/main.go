package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"context"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/jamesBoder/daily-stoic/internal/config"
	"github.com/jamesBoder/daily-stoic/internal/database"
	"github.com/jamesBoder/daily-stoic/internal/handlers"
	"github.com/jamesBoder/daily-stoic/internal/middleware"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/routes"
	"github.com/jamesBoder/daily-stoic/internal/seeds"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

func main() {
	// 1. Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// 2. Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 3. Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// 4. Seed if empty (no-op after first run)
	if err := seeds.SeedIfEmpty(db); err != nil {
		log.Printf("Warning: seeding failed: %v", err)
	}

	// 5. Upsert dev account with lifetime access (idempotent, local only)
	if err := seeds.SeedDevUser(db); err != nil {
		log.Printf("Warning: dev user seed failed: %v", err)
	}

	// 6. Seed premium Hermetic + Neoplatonic content (idempotent)
	if err := seeds.SeedPremiumContent(db); err != nil {
		log.Printf("Warning: premium content seed failed: %v", err)
	}

	// 7. Seed expansion traditions: Buddhism, Taoism, Vedanta, Existentialism, Kemetic Wisdom (idempotent)
	if err := seeds.SeedNewTraditions(db); err != nil {
		log.Printf("Warning: new traditions seed failed: %v", err)
	}

	// 8. Patch author bios and quote commentary/practice prompts (idempotent)
	if err := seeds.UpdateAuthorBios(db); err != nil {
		log.Printf("Warning: author bio update failed: %v", err)
	}
	if err := seeds.UpdateQuoteContent(db); err != nil {
		log.Printf("Warning: quote content update failed: %v", err)
	}

	// 9. Repositories
	userRepo            := repository.NewUserRepository(db)
	quoteRepo           := repository.NewQuoteRepository(db)
	authorRepo          := repository.NewAuthorRepository(db)
	traditionRepo       := repository.NewTraditionRepository(db)
	favoriteRepo        := repository.NewFavoriteRepository(db)
	historyRepo         := repository.NewHistoryRepository(db)
	commentRepo         := repository.NewCommentRepository(db)
	streakRepo          := repository.NewStreakRepository(db)
	passwordHistoryRepo := repository.NewPasswordHistoryRepository(db)
	subscriptionRepo    := repository.NewSubscriptionRepository(db)

	// 5. Services
	tokenSvc      := services.NewTokenService(cfg)
	emailSvc      := services.NewEmailService(cfg.ResendAPIKey, cfg.FromEmail, cfg.FrontendURL)
	emailValidSvc := services.NewEmailValidationService()
	dailyQuoteSvc := services.NewDailyQuoteService(quoteRepo)
	streakSvc     := services.NewStreakService(streakRepo, historyRepo)
	favoriteSvc   := services.NewFavoriteService(favoriteRepo, quoteRepo)
	historySvc    := services.NewHistoryService(historyRepo)
	commentSvc    := services.NewCommentService(commentRepo)
	settingsSvc   := services.NewSettingsService(db)

	// Philosophy API service — used by seeding scripts, not live endpoints in Phase 1
	_ = services.NewPhilosophyAPIService(cfg.PhilosophyAPIBaseURL, cfg.PhilosophyAPIKey)

	stripeSvc := services.NewStripeService(cfg, subscriptionRepo)

	// OAuth service
	oauthCfg    := config.GoogleOAuthConfig()
	oauthSvc    := services.NewOAuthService(userRepo, tokenSvc, oauthCfg)

	// 6. Validator
	validate := validator.New()

	// 7. Handlers
	authHandler     := handlers.NewAuthHandler(userRepo, tokenSvc, emailValidSvc, emailSvc, passwordHistoryRepo)
	oauthHandler    := handlers.NewOAuthHandler(oauthSvc)
	quoteHandler    := handlers.NewQuoteHandler(quoteRepo, authorRepo, traditionRepo, dailyQuoteSvc, streakSvc)
	favoriteHandler := handlers.NewFavoriteHandler(favoriteSvc)
	historyHandler  := handlers.NewHistoryHandler(historySvc)
	commentHandler  := handlers.NewCommentHandler(commentSvc)
	profileHandler  := handlers.NewProfileHandler(
		userRepo, favoriteRepo, historyRepo, commentRepo,
		passwordHistoryRepo, streakRepo,
		emailSvc, emailValidSvc, streakSvc, validate,
	)
	settingsHandler     := handlers.NewSettingsHandler(settingsSvc)
	onboardingHandler   := handlers.NewOnboardingHandler(settingsSvc)
	subscriptionHandler := handlers.NewSubscriptionHandler(subscriptionRepo, stripeSvc, cfg)

	_ = validate // used by profileHandler

	// 8. Router
	r := gin.Default()
	r.RedirectTrailingSlash = false

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Use(middleware.ErrorHandler())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "timestamp": time.Now().UTC()})
	})

	routes.SetupRoutes(r, authHandler, oauthHandler, quoteHandler, favoriteHandler,
		historyHandler, commentHandler, profileHandler, settingsHandler, onboardingHandler,
		subscriptionHandler, tokenSvc, subscriptionRepo)

	// 9. Start server with graceful shutdown
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    "0.0.0.0:" + port,
		Handler: r,
	}

	go func() {
		log.Printf("Server is running at 0.0.0.0:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}
	log.Println("Server exited")
}
