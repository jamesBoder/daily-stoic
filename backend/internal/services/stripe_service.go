package services

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"github.com/jamesBoder/daily-stoic/internal/config"
	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/webhook"
)

type StripeService struct {
	cfg              *config.Config
	subscriptionRepo *repository.SubscriptionRepository
}

func NewStripeService(cfg *config.Config, subscriptionRepo *repository.SubscriptionRepository) *StripeService {
	stripe.Key = cfg.StripeSecretKey
	return &StripeService{cfg: cfg, subscriptionRepo: subscriptionRepo}
}

// CreateCheckoutSession creates a Stripe one-time payment checkout session.
// Returns the hosted checkout URL to redirect the user to.
func (s *StripeService) CreateCheckoutSession(userID uint, existingCustomerID, successURL, cancelURL string) (string, error) {
	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(s.cfg.StripeLifetimePriceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL:        stripe.String(successURL),
		CancelURL:         stripe.String(cancelURL),
		ClientReferenceID: stripe.String(strconv.Itoa(int(userID))),
		PaymentIntentData: &stripe.CheckoutSessionPaymentIntentDataParams{
			Metadata: map[string]string{
				"user_id": strconv.Itoa(int(userID)),
			},
		},
	}

	if existingCustomerID != "" {
		params.Customer = stripe.String(existingCustomerID)
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("stripe checkout session: %w", err)
	}
	return sess.URL, nil
}

// HandleWebhook verifies the Stripe signature and processes the event.
// Only checkout.session.completed is handled — lifetime purchases only.
// Unknown events return nil so Stripe does not retry them.
func (s *StripeService) HandleWebhook(payload []byte, sigHeader string) error {
	event, err := webhook.ConstructEvent(payload, sigHeader, s.cfg.StripeWebhookSecret)
	if err != nil {
		return fmt.Errorf("webhook signature verification failed: %w", err)
	}

	switch event.Type {
	case "checkout.session.completed":
		return s.handleCheckoutCompleted(event)
	default:
		log.Printf("stripe webhook: unhandled event type %s", event.Type)
		return nil
	}
}

func (s *StripeService) handleCheckoutCompleted(event stripe.Event) error {
	var sess stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
		return fmt.Errorf("unmarshal checkout session: %w", err)
	}

	if sess.ClientReferenceID == "" {
		log.Printf("stripe webhook: checkout.session.completed missing client_reference_id, skipping")
		return nil
	}

	uid, err := strconv.ParseUint(sess.ClientReferenceID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid client_reference_id %q: %w", sess.ClientReferenceID, err)
	}

	customerID := ""
	if sess.Customer != nil {
		customerID = sess.Customer.ID
	}

	sub := &models.Subscription{
		UserID:           uint(uid),
		StripeCustomerID: customerID,
		StripePaymentID:  sess.ID,
		Tier:             "lifetime",
		Status:           "active",
	}

	if err := s.subscriptionRepo.Upsert(sub); err != nil {
		return fmt.Errorf("upsert subscription for user %d: %w", uid, err)
	}

	log.Printf("stripe webhook: user %d upgraded to lifetime", uid)
	return nil
}
