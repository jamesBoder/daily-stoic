package models

import "time"

// ReadingPlan is a curated multi-day journey through a tradition or theme.
type ReadingPlan struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Slug         string `gorm:"size:100;uniqueIndex;not null" json:"slug"`
	Title        string `gorm:"size:255;not null" json:"title"`
	Description  string `gorm:"type:text" json:"description"`
	Tier         string `gorm:"size:20;default:'free'" json:"tier"` // "free" | "premium"
	DurationDays int    `gorm:"not null" json:"duration_days"`
	TraditionID  *uint  `gorm:"index" json:"tradition_id,omitempty"`

	Tradition *Tradition         `gorm:"foreignKey:TraditionID" json:"tradition,omitempty"`
	Entries   []ReadingPlanEntry `gorm:"foreignKey:ReadingPlanID;constraint:OnDelete:CASCADE" json:"entries,omitempty"`
}

// ReadingPlanEntry is a single day in a reading plan.
type ReadingPlanEntry struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	ReadingPlanID uint   `gorm:"not null;index" json:"reading_plan_id"`
	DayNumber     int    `gorm:"not null" json:"day_number"`
	Title         string `gorm:"size:255;not null" json:"title"`
	IntroText     string `gorm:"type:text" json:"intro_text"`
	QuoteID       *uint  `gorm:"index" json:"quote_id,omitempty"`

	Quote *Quote `gorm:"foreignKey:QuoteID" json:"quote,omitempty"`
}

// UserReadingPlanProgress tracks where a user is in a reading plan.
type UserReadingPlanProgress struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	UserID        uint       `gorm:"not null;index" json:"user_id"`
	ReadingPlanID uint       `gorm:"not null;index" json:"reading_plan_id"`
	CurrentDay    int        `gorm:"default:1" json:"current_day"`
	StartedAt     time.Time  `json:"started_at"`
	CompletedAt   *time.Time `json:"completed_at,omitempty"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
}
