package models

import (
	"time"

	"gorm.io/gorm"
)

// Subscription tracks a user's payment tier.
// Lifetime-only model — no recurring subscription fields needed.
// A canceled/refunded row stays in the DB with tier='free'.
type Subscription struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	UserID           uint   `gorm:"not null;uniqueIndex" json:"user_id"`
	StripeCustomerID string `gorm:"size:100" json:"stripe_customer_id,omitempty"`
	StripePaymentID  string `gorm:"size:100" json:"stripe_payment_id,omitempty"` // checkout session or payment intent ID
	Tier             string `gorm:"size:20;default:'free'" json:"tier"`          // "free" | "lifetime"
	Status           string `gorm:"size:20;default:'active'" json:"status"`      // "active" | "refunded"

	User User `gorm:"foreignKey:UserID" json:"-"`
}
