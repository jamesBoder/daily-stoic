package models

import "time"

// Achievement records a badge earned by a user.
// BadgeSlug values: "first-step", "the-stoic-week", "the-inner-citadel",
// "one-hundred-suns", "the-philosophers-year", "marcuss-shadow", etc.
type Achievement struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	BadgeSlug string    `gorm:"size:100;not null" json:"badge_slug"`
	EarnedAt  time.Time `json:"earned_at"`
}
