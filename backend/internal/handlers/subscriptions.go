package handlers

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/config"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

type SubscriptionHandler struct {
	subscriptionRepo *repository.SubscriptionRepository
	stripeSvc        *services.StripeService
	cfg              *config.Config
}

func NewSubscriptionHandler(
	subscriptionRepo *repository.SubscriptionRepository,
	stripeSvc *services.StripeService,
	cfg *config.Config,
) *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionRepo: subscriptionRepo,
		stripeSvc:        stripeSvc,
		cfg:              cfg,
	}
}

// GET /api/subscription
// Returns the current user's tier. Returns { tier: "free" } for unauthenticated requests — never 401.
func (h *SubscriptionHandler) GetStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusOK, gin.H{"tier": "free"})
		return
	}

	sub, err := h.subscriptionRepo.GetByUserID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"tier": "free"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tier":   sub.Tier,
		"status": sub.Status,
	})
}

// POST /api/subscription/checkout
// Creates a Stripe checkout session and returns { url } to redirect the user to.
func (h *SubscriptionHandler) CreateCheckout(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Look up existing Stripe customer ID so Stripe reuses their billing profile
	existingSub, err := h.subscriptionRepo.GetByUserID(userID)
	existingCustomerID := ""
	if err == nil {
		existingCustomerID = existingSub.StripeCustomerID
	}

	// If already lifetime, don't create a new session
	if existingSub != nil && existingSub.Tier == "lifetime" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already a lifetime member"})
		return
	}

	successURL := h.cfg.FrontendURL + "/subscription/success"
	cancelURL := h.cfg.FrontendURL + "/upgrade"

	url, err := h.stripeSvc.CreateCheckoutSession(userID, existingCustomerID, successURL, cancelURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create checkout session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}

// POST /api/subscription/webhook
// Stripe calls this endpoint. Raw body must be read before any parsing.
// Always returns HTTP 200 — Stripe retries on any non-200.
func (h *SubscriptionHandler) HandleWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		// Return 200 anyway — a read error on our side shouldn't cause Stripe to retry
		c.Status(http.StatusOK)
		return
	}

	sigHeader := c.GetHeader("Stripe-Signature")

	if err := h.stripeSvc.HandleWebhook(payload, sigHeader); err != nil {
		// Log but still return 200 for unknown/unverifiable events
		// Return 400 only for signature failures so Stripe knows the secret is wrong
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
