package repository

import (
	"errors"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

// ErrPlanNotStarted is returned by AdvanceDay when the user has no active progress record.
var ErrPlanNotStarted = errors.New("plan not started")

type ReadingPlanRepository struct {
	db *gorm.DB
}

func NewReadingPlanRepository(db *gorm.DB) *ReadingPlanRepository {
	return &ReadingPlanRepository{db: db}
}

// GetIDBySlug returns only the plan ID for a given slug — cheap lookup for progress queries.
func (r *ReadingPlanRepository) GetIDBySlug(slug string) (uint, error) {
	var plan struct{ ID uint }
	err := r.db.Model(&models.ReadingPlan{}).Select("id").Where("slug = ?", slug).First(&plan).Error
	if err != nil {
		return 0, err
	}
	return plan.ID, nil
}

// GetAll returns all reading plans without entries (for list view).
func (r *ReadingPlanRepository) GetAll() ([]models.ReadingPlan, error) {
	var plans []models.ReadingPlan
	err := r.db.Preload("Tradition").Find(&plans).Error
	return plans, err
}

// GetBySlug returns a plan with all entries and their linked quotes.
func (r *ReadingPlanRepository) GetBySlug(slug string) (*models.ReadingPlan, error) {
	var plan models.ReadingPlan
	err := r.db.
		Where("slug = ?", slug).
		Preload("Tradition").
		Preload("Entries", func(db *gorm.DB) *gorm.DB {
			return db.Order("day_number ASC")
		}).
		Preload("Entries.Quote").
		Preload("Entries.Quote.Author").
		First(&plan).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

// GetProgress returns the active progress record for a user + plan, or nil if not started.
func (r *ReadingPlanRepository) GetProgress(userID, planID uint) (*models.UserReadingPlanProgress, error) {
	var progress models.UserReadingPlanProgress
	err := r.db.
		Where("user_id = ? AND reading_plan_id = ? AND is_active = true", userID, planID).
		First(&progress).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &progress, err
}

// StartPlan creates a new progress record. Idempotent — returns existing if already active.
func (r *ReadingPlanRepository) StartPlan(userID, planID uint) (*models.UserReadingPlanProgress, error) {
	existing, err := r.GetProgress(userID, planID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return existing, nil
	}
	progress := &models.UserReadingPlanProgress{
		UserID:        userID,
		ReadingPlanID: planID,
		CurrentDay:    1,
		IsActive:      true,
		StartedAt:     time.Now(),
	}
	if err := r.db.Create(progress).Error; err != nil {
		return nil, err
	}
	return progress, nil
}

// AdvanceDay increments CurrentDay by 1, capped at duration_days, marks complete when done.
func (r *ReadingPlanRepository) AdvanceDay(userID, planID uint, durationDays int) (*models.UserReadingPlanProgress, error) {
	progress, err := r.GetProgress(userID, planID)
	if err != nil {
		return nil, err
	}
	if progress == nil {
		return nil, ErrPlanNotStarted
	}
	if progress.CurrentDay < durationDays {
		progress.CurrentDay++
	}
	if progress.CurrentDay == durationDays && progress.CompletedAt == nil {
		now := time.Now()
		progress.CompletedAt = &now
	}
	err = r.db.Save(progress).Error
	return progress, err
}
