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
