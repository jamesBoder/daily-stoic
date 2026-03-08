package repository

import (
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type HistoryRepository interface {
	Create(history *models.History) error
	GetByUserID(userID uint) ([]models.History, error)
	GetByUserIDPaginated(userID uint, limit, offset int) ([]models.History, int64, error)
	DeleteByUserID(userID uint) error
	DeleteOlderThan(userID uint, date time.Time) error
	CountByUserID(userID uint) (int64, error)
	FindByUserAndQuote(userID, quoteID uint) (*models.History, error)
	UpdateViewedAt(historyID uint, viewedAt time.Time) error
	HasViewedToday(userID uint, date string) (bool, error)
}

type historyRepository struct {
	db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
	return &historyRepository{db: db}
}

func (r *historyRepository) Create(history *models.History) error {
	return r.db.Create(history).Error
}

func (r *historyRepository) GetByUserID(userID uint) ([]models.History, error) {
	var history []models.History
	err := r.db.Where("user_id = ?", userID).
		Preload("Quote").Preload("Quote.Author").Preload("Quote.Tradition").
		Order("viewed_at DESC").
		Find(&history).Error
	return history, err
}

func (r *historyRepository) GetByUserIDPaginated(userID uint, limit, offset int) ([]models.History, int64, error) {
	var history []models.History
	var total int64

	r.db.Model(&models.History{}).Where("user_id = ?", userID).Count(&total)

	err := r.db.Where("user_id = ?", userID).
		Preload("Quote").Preload("Quote.Author").Preload("Quote.Tradition").
		Order("viewed_at DESC").
		Limit(limit).Offset(offset).
		Find(&history).Error

	return history, total, err
}

func (r *historyRepository) DeleteByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.History{}).Error
}

func (r *historyRepository) DeleteOlderThan(userID uint, date time.Time) error {
	return r.db.Where("user_id = ? AND viewed_at < ?", userID, date).Delete(&models.History{}).Error
}

func (r *historyRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.History{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

func (r *historyRepository) FindByUserAndQuote(userID, quoteID uint) (*models.History, error) {
	var history models.History
	err := r.db.Where("user_id = ? AND quote_id = ?", userID, quoteID).First(&history).Error
	if err != nil {
		return nil, err
	}
	return &history, nil
}

func (r *historyRepository) UpdateViewedAt(historyID uint, viewedAt time.Time) error {
	return r.db.Model(&models.History{}).Where("id = ?", historyID).Update("viewed_at", viewedAt).Error
}

// HasViewedToday checks if the user has a history entry with viewed_at on the given date (format: "2006-01-02")
func (r *historyRepository) HasViewedToday(userID uint, date string) (bool, error) {
	var count int64
	err := r.db.Model(&models.History{}).
		Where("user_id = ? AND DATE(viewed_at) = ?", userID, date).
		Count(&count).Error
	return count > 0, err
}
