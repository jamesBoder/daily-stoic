package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

// PasswordHistoryRepository interface
type PasswordHistoryRepository interface {
	Create(history *models.PasswordHistory) error
	GetRecentByUserID(userID uint, limit int) ([]models.PasswordHistory, error)
	DeleteOldestForUser(userID uint, keepCount int) error
}

// passwordHistoryRepo implementation
type passwordHistoryRepo struct {
	db *gorm.DB
}

// NewPasswordHistoryRepository creates a new password history repository
func NewPasswordHistoryRepository(db *gorm.DB) PasswordHistoryRepository {
	return &passwordHistoryRepo{db: db}
}

// Create adds a new password history entry
func (r *passwordHistoryRepo) Create(history *models.PasswordHistory) error {
	return r.db.Create(history).Error
}

// GetRecentByUserID retrieves the most recent N password history entries for a user
func (r *passwordHistoryRepo) GetRecentByUserID(userID uint, limit int) ([]models.PasswordHistory, error) {
	var histories []models.PasswordHistory
	err := r.db.Where("user_id = ?", userID).
		Order("changed_at DESC").
		Limit(limit).
		Find(&histories).Error
	return histories, err
}

// DeleteOldestForUser removes old password history entries, keeping only the most recent N
func (r *passwordHistoryRepo) DeleteOldestForUser(userID uint, keepCount int) error {
	// Get all password histories for user, ordered by date
	var histories []models.PasswordHistory
	err := r.db.Where("user_id = ?", userID).
		Order("changed_at DESC").
		Find(&histories).Error
	
	if err != nil {
		return err
	}

	// If we have more than keepCount, delete the oldest ones
	if len(histories) > keepCount {
		// Get IDs of entries to delete (everything after keepCount)
		var idsToDelete []uint
		for i := keepCount; i < len(histories); i++ {
			idsToDelete = append(idsToDelete, histories[i].ID)
		}

		// Delete old entries
		if len(idsToDelete) > 0 {
			err = r.db.Where("id IN ?", idsToDelete).Delete(&models.PasswordHistory{}).Error
		}
	}

	return err
}
