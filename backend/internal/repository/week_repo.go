package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type WeekRepository struct {
	db *gorm.DB
}

func NewWeekRepository(db *gorm.DB) *WeekRepository {
	return &WeekRepository{db: db}
}

// GetCurrent returns the Week record whose start_date is the most recent Monday
// on or before today. Returns nil if no weeks have been seeded yet.
func (r *WeekRepository) GetCurrent(today string) (*models.Week, error) {
	var week models.Week
	err := r.db.
		Where("start_date <= ?", today).
		Order("start_date DESC").
		Preload("Quotes", func(db *gorm.DB) *gorm.DB {
			return db.Order("quality_score DESC")
		}).
		Preload("Quotes.Author").
		Preload("Quotes.Tradition").
		First(&week).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &week, err
}

// ExistsForStartDate returns true if a Week record already exists for the given Monday.
func (r *WeekRepository) ExistsForStartDate(startDate string) bool {
	var count int64
	r.db.Model(&models.Week{}).Where("start_date = ?", startDate).Count(&count)
	return count > 0
}

// RecentQuoteIDs returns quote IDs used in the N most recent weeks (for deduplication).
func (r *WeekRepository) RecentQuoteIDs(n int) ([]uint, error) {
	var weekIDs []uint
	r.db.Model(&models.Week{}).Order("start_date DESC").Limit(n).Pluck("id", &weekIDs)
	if len(weekIDs) == 0 {
		return nil, nil
	}
	var quoteIDs []uint
	err := r.db.Table("week_quotes").
		Where("week_id IN ?", weekIDs).
		Pluck("quote_id", &quoteIDs).Error
	return quoteIDs, err
}

// Create persists a new Week and associates its quotes.
func (r *WeekRepository) Create(week *models.Week) error {
	return r.db.Create(week).Error
}
