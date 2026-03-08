package models

import (
	"time"

	"gorm.io/gorm"
)

// Quote is the central content unit of the app — replaces Verse from Daily Bible.
type Quote struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Content
	Text             string `gorm:"type:text;not null" json:"text"`
	ContextNote      string `gorm:"type:text" json:"context_note,omitempty"`       // Short explanation — free teaser
	ContextFull      string `gorm:"type:text" json:"context_full,omitempty"`       // Extended commentary — premium only
	ReflectionPrompt string `gorm:"type:text" json:"reflection_prompt,omitempty"`  // Daily journaling prompt — premium only
	Source           string `gorm:"size:255" json:"source"`                        // e.g. "Meditations, Book IV"

	// Attribution
	AuthorID uint   `gorm:"not null" json:"author_id"`
	Author   Author `gorm:"foreignKey:AuthorID" json:"author,omitempty"`

	// Classification
	TraditionID uint      `gorm:"not null" json:"tradition_id"`
	Tradition   Tradition `gorm:"foreignKey:TraditionID" json:"tradition,omitempty"`
	Themes      string    `gorm:"type:text" json:"themes"` // JSON-encoded string array: ["resilience","virtue"]

	// Scheduling
	DailyDate *string `gorm:"uniqueIndex;type:date" json:"daily_date,omitempty"`

	// Access control
	Tier         string  `gorm:"size:20;default:'free'" json:"tier"` // "free" | "premium"
	QualityScore float64 `gorm:"default:0" json:"quality_score"`

	// NOTE: embedding vector(1536) column is added via raw SQL migration — NOT managed by GORM.
	// Never add the embedding field to this struct — GORM will conflict with the pgvector type.

	// Relationships
	Favorites []Favorite `gorm:"foreignKey:QuoteID" json:"favorites,omitempty"`
	History   []History  `gorm:"foreignKey:QuoteID" json:"history,omitempty"`
	Comments  []Comment  `gorm:"foreignKey:QuoteID" json:"comments,omitempty"`
}
