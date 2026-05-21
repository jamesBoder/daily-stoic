package repository

import (
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type ConfluenceRepository struct {
	db *gorm.DB
}

func NewConfluenceRepository(db *gorm.DB) *ConfluenceRepository {
	return &ConfluenceRepository{db: db}
}

func (r *ConfluenceRepository) GetPuzzleForDate(date time.Time) (*models.ConfluencePuzzle, error) {
	var puzzle models.ConfluencePuzzle
	dateOnly := date.Truncate(24 * time.Hour)
	err := r.db.
		Preload("Groups", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Groups.Cards", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Groups.Cards.Concept").
		Preload("Groups.Cards.Concept.Tradition").
		Where("DATE(date) = DATE(?)", dateOnly).
		First(&puzzle).Error
	if err != nil {
		return nil, err
	}
	return &puzzle, nil
}

func (r *ConfluenceRepository) GetPuzzleByID(id uint) (*models.ConfluencePuzzle, error) {
	var puzzle models.ConfluencePuzzle
	err := r.db.
		Preload("Groups", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Groups.Cards", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Groups.Cards.Concept").
		Preload("Groups.Cards.Concept.Tradition").
		First(&puzzle, id).Error
	if err != nil {
		return nil, err
	}
	return &puzzle, nil
}

func (r *ConfluenceRepository) GetOrCreateSession(userID, puzzleID uint) (*models.ConfluenceGameSession, bool, error) {
	var session models.ConfluenceGameSession
	err := r.db.Where("user_id = ? AND puzzle_id = ?", userID, puzzleID).
		First(&session).Error
	if err == gorm.ErrRecordNotFound {
		session = models.ConfluenceGameSession{
			UserID:      userID,
			PuzzleID:    puzzleID,
			Status:      "in_progress",
			GroupsFound: models.UintSlice{},
			Attempts:    models.GuessLog{},
		}
		if err = r.db.Create(&session).Error; err != nil {
			return nil, false, err
		}
		return &session, true, nil
	} else if err != nil {
		return nil, false, err
	}
	return &session, false, nil
}

func (r *ConfluenceRepository) SaveSession(session *models.ConfluenceGameSession) error {
	return r.db.Save(session).Error
}

func (r *ConfluenceRepository) GetSession(userID, puzzleID uint) (*models.ConfluenceGameSession, error) {
	var session models.ConfluenceGameSession
	err := r.db.Where("user_id = ? AND puzzle_id = ?", userID, puzzleID).
		First(&session).Error
	return &session, err
}
