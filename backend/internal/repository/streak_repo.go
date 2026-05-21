package repository

import (
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type StreakRepository interface {
	GetByUserID(userID uint) (*models.UserStreak, error)
	Upsert(streak *models.UserStreak) error
	GetAchievements(userID uint) ([]models.Achievement, error)
	AwardAchievement(userID uint, badgeSlug string) error
}

type streakRepository struct {
	db *gorm.DB
}

func NewStreakRepository(db *gorm.DB) StreakRepository {
	return &streakRepository{db: db}
}

func (r *streakRepository) GetByUserID(userID uint) (*models.UserStreak, error) {
	var streak models.UserStreak
	err := r.db.Where("user_id = ?", userID).First(&streak).Error
	if err != nil {
		return nil, err
	}
	return &streak, nil
}

func (r *streakRepository) Upsert(streak *models.UserStreak) error {
	return r.db.Save(streak).Error
}

func (r *streakRepository) GetAchievements(userID uint) ([]models.Achievement, error) {
	var achievements []models.Achievement
	err := r.db.Where("user_id = ?", userID).Order("earned_at DESC").Find(&achievements).Error
	return achievements, err
}

// AwardAchievement creates a new achievement record only if the badge hasn't been earned yet.
// Idempotent — safe to call multiple times.
func (r *streakRepository) AwardAchievement(userID uint, badgeSlug string) error {
	var count int64
	r.db.Model(&models.Achievement{}).
		Where("user_id = ? AND badge_slug = ?", userID, badgeSlug).
		Count(&count)
	if count > 0 {
		return nil
	}
	achievement := &models.Achievement{
		UserID:    userID,
		BadgeSlug: badgeSlug,
		EarnedAt:  time.Now(),
	}
	return r.db.Create(achievement).Error
}
