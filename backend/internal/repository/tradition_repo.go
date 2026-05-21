package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type TraditionRepository struct {
	db *gorm.DB
}

func NewTraditionRepository(db *gorm.DB) *TraditionRepository {
	return &TraditionRepository{db: db}
}

func (r *TraditionRepository) GetAll() ([]models.Tradition, error) {
	var traditions []models.Tradition
	err := r.db.Order("sort_order ASC").Find(&traditions).Error
	return traditions, err
}

// GetBySlug returns a tradition with its authors preloaded, matched by slug.
func (r *TraditionRepository) GetBySlug(slug string) (*models.Tradition, error) {
	var tradition models.Tradition
	err := r.db.Where("slug = ?", slug).
		Preload("Authors", func(db *gorm.DB) *gorm.DB {
			return db.Order("name ASC")
		}).
		First(&tradition).Error
	if err != nil {
		return nil, err
	}
	return &tradition, nil
}
