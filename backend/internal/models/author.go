package models

import (
	"time"

	"gorm.io/gorm"
)

// Author represents a philosopher whose quotes appear in the app
type Author struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Slug        string `gorm:"size:100;uniqueIndex;not null" json:"slug"`
	Name        string `gorm:"size:100;not null" json:"name"`
	Born        string `gorm:"size:50" json:"born,omitempty"`
	Died        string `gorm:"size:50" json:"died,omitempty"`
	Nationality string `gorm:"size:100" json:"nationality,omitempty"`
	Bio         string `gorm:"type:text" json:"bio,omitempty"`
	TraditionID uint   `json:"tradition_id"`
	ImageURL    string `gorm:"size:500" json:"image_url,omitempty"`

	// External source identifiers
	PhilosophyAPIID string `gorm:"size:100" json:"philosophy_api_id,omitempty"`
	WikidataID      string `gorm:"size:50" json:"wikidata_id,omitempty"`

	Quotes []Quote `gorm:"foreignKey:AuthorID" json:"quotes,omitempty"`
}
