package models

import (
	"time"

	"gorm.io/gorm"
)

type UserLibraryCard struct {
	ID         uint          `gorm:"primaryKey" json:"id"`
	UserID     uint          `gorm:"not null;index" json:"user_id"`
	ConceptID  uint          `gorm:"not null;index" json:"concept_id"`
	Concept    WisdomConcept `gorm:"foreignKey:ConceptID" json:"concept,omitempty"`
	RarityTier string        `gorm:"type:varchar(20);not null;default:'common'" json:"rarity_tier"`
	EarnedVia  string        `gorm:"type:varchar(30);not null" json:"earned_via"` // "confluence"|"duel"|etc.
	State      string        `gorm:"type:varchar(20);not null;default:'discovery'" json:"state"` // discovery|illumination|radiance
	EarnedAt   time.Time     `json:"earned_at"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
// Unique: one entry per user per concept — rarity upgrades in place, never duplicates.
// CREATE UNIQUE INDEX idx_user_library_card ON user_library_cards(user_id, concept_id) WHERE deleted_at IS NULL
