package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	Port       string
	JWTSecret  string

	// OAuth
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	FrontendURL        string
	AllowedOrigins     []string

	// Email
	ResendAPIKey string
	FromEmail    string

	// Philosophy API (author metadata enrichment)
	PhilosophyAPIKey     string
	PhilosophyAPIBaseURL string

	// Stripe (lifetime purchase only)
	StripeSecretKey       string
	StripeWebhookSecret   string
	StripeLifetimePriceID string

	// Anthropic (Ask the Philosopher feature — backend only, never expose to frontend)
	AnthropicAPIKey string

	// Web Push (VAPID)
	VAPIDPublicKey  string
	VAPIDPrivateKey string
	VAPIDSubject    string
}

func Load() (*Config, error) {
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")

	return &Config{
		DBHost:                os.Getenv("DB_HOST"),
		DBPort:                os.Getenv("DB_PORT"),
		DBUser:                os.Getenv("DB_USER"),
		DBPassword:            os.Getenv("DB_PASSWORD"),
		DBName:                os.Getenv("DB_NAME"),
		DBSSLMode:             os.Getenv("DB_SSLMODE"),
		Port:                  getEnvOrDefault("PORT", "8080"),
		JWTSecret:             os.Getenv("JWT_SECRET"),
		GoogleClientID:        os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:    os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURL:     os.Getenv("GOOGLE_REDIRECT_URL"),
		FrontendURL:           getEnvOrDefault("FRONTEND_URL", "http://localhost"),
		AllowedOrigins:        parseAllowedOrigins(),
		ResendAPIKey:          os.Getenv("RESEND_API_KEY"),
		FromEmail:             getEnvOrDefault("FROM_EMAIL", "noreply@dailyxam.app"),
		PhilosophyAPIKey:      os.Getenv("PHILOSOPHY_API_KEY"),
		PhilosophyAPIBaseURL:  getEnvOrDefault("PHILOSOPHY_API_BASE_URL", "https://philosophyapi.com/api"),
		StripeSecretKey:       os.Getenv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret:   os.Getenv("STRIPE_WEBHOOK_SECRET"),
		StripeLifetimePriceID: os.Getenv("STRIPE_LIFETIME_PRICE_ID"),
		AnthropicAPIKey:       os.Getenv("ANTHROPIC_API_KEY"),
		VAPIDPublicKey:        os.Getenv("VAPID_PUBLIC_KEY"),
		VAPIDPrivateKey:       os.Getenv("VAPID_PRIVATE_KEY"),
		VAPIDSubject:          getEnvOrDefault("VAPID_SUBJECT", "mailto:hello@dailyxam.app"),
	}, nil
}

// parseAllowedOrigins reads ALLOWED_ORIGINS (comma-separated) and falls back
// to FRONTEND_URL so existing deployments need no immediate config change.
func parseAllowedOrigins() []string {
	if v := os.Getenv("ALLOWED_ORIGINS"); v != "" {
		var origins []string
		for _, o := range strings.Split(v, ",") {
			if trimmed := strings.TrimSpace(o); trimmed != "" {
				origins = append(origins, trimmed)
			}
		}
		return origins
	}
	return []string{getEnvOrDefault("FRONTEND_URL", "http://localhost")}
}

func getEnvOrDefault(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}
