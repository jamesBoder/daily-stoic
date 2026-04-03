package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SubscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

// GetByUserID returns the subscription for a user.
// When no row exists, returns a synthetic free-tier subscription — never an error.
// Callers never need to nil-check for free users.
func (r *SubscriptionRepository) GetByUserID(userID uint) (*models.Subscription, error) {
	var sub models.Subscription
	err := r.db.Where("user_id = ?", userID).First(&sub).Error
	if err == gorm.ErrRecordNotFound {
		return &models.Subscription{UserID: userID, Tier: "free", Status: "active"}, nil
	}
	return &sub, err
}

// GetByStripeCustomerID looks up a subscription by Stripe customer ID.
func (r *SubscriptionRepository) GetByStripeCustomerID(customerID string) (*models.Subscription, error) {
	var sub models.Subscription
	err := r.db.Where("stripe_customer_id = ?", customerID).First(&sub).Error
	return &sub, err
}

// Upsert inserts or updates the subscription row for a user.
func (r *SubscriptionRepository) Upsert(sub *models.Subscription) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"stripe_customer_id", "stripe_payment_id", "tier", "status", "updated_at"}),
	}).Create(sub).Error
}
