package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PushRepository struct {
	db *gorm.DB
}

func NewPushRepository(db *gorm.DB) *PushRepository {
	return &PushRepository{db: db}
}

func (r *PushRepository) Upsert(sub *models.PushSubscription) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "endpoint"}},
		DoUpdates: clause.AssignmentColumns([]string{"auth", "p256dh", "user_id"}),
	}).Create(sub).Error
}

func (r *PushRepository) DeleteByEndpoint(endpoint string, userID uint) error {
	return r.db.Where("endpoint = ? AND user_id = ?", endpoint, userID).
		Delete(&models.PushSubscription{}).Error
}

func (r *PushRepository) ExistsByEndpoint(endpoint string, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.PushSubscription{}).
		Where("endpoint = ? AND user_id = ?", endpoint, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *PushRepository) FindAllActive() ([]models.PushSubscription, error) {
	var subs []models.PushSubscription
	err := r.db.Find(&subs).Error
	return subs, err
}
