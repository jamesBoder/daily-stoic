package models

// Tradition represents a philosophical tradition (Stoicism, Hermeticism, etc.)
type Tradition struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"size:100;uniqueIndex;not null" json:"name"`
	Slug        string `gorm:"size:100;uniqueIndex;not null" json:"slug"`
	Description string `gorm:"type:text" json:"description,omitempty"`
	Tier        string `gorm:"size:20;default:'free'" json:"tier"`
	SortOrder   int    `gorm:"default:0" json:"sort_order"`

	Authors []Author `gorm:"foreignKey:TraditionID" json:"authors,omitempty"`
	Quotes  []Quote  `gorm:"foreignKey:TraditionID" json:"quotes,omitempty"`
}
