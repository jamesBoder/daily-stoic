package models

import (
	"gorm.io/gorm"
	"time"
)

// UserSettings represents user-specific settings and preferences
type UserSettings struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Foreign key to User
	UserID uint `gorm:"uniqueIndex;not null" json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"-"`

	// Language and localization
	PreferredLanguage string `gorm:"size:10;default:'en'" json:"preferred_language"`

	// Notification preferences
	EmailNotifications bool `gorm:"default:true" json:"email_notifications"`
	DailyVerseReminder bool `gorm:"default:true" json:"daily_verse_reminder"`

	// Display preferences
	DarkMode bool `gorm:"default:false" json:"dark_mode"`

	// Onboarding
	OnboardingCompleted bool     `gorm:"default:false" json:"onboarding_completed"`
	PreferredTraditions []string `gorm:"serializer:json;type:text;default:'[]'" json:"preferred_traditions"`
	PreferredGoals      []string `gorm:"serializer:json;type:text;default:'[]'" json:"preferred_goals"`
}
