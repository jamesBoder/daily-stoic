package models

// Week represents a curated weekly theme with 7 associated quotes.
// StartDate is the ISO date of Monday for that week (e.g. "2026-04-07").
type Week struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	StartDate   string  `gorm:"type:date;uniqueIndex;not null" json:"start_date"`
	EndDate     string  `gorm:"type:date;not null" json:"end_date"`
	Theme       string  `gorm:"size:100;not null" json:"theme"`  // slug, e.g. "resilience"
	Title       string  `gorm:"size:255;not null" json:"title"`  // e.g. "Week of Resilience"
	Description string  `gorm:"type:text" json:"description"`
	Quotes      []Quote `gorm:"many2many:week_quotes" json:"quotes,omitempty"`
}
