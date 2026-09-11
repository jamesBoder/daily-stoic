package repository

import (
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

	// Try exact date match first.
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

	if err == nil {
		return &puzzle, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// No puzzle for today — fall back to the most recent available puzzle.
	// Keeps local dev working when seed data doesn't cover the current date.
	err = r.db.
		Preload("Groups", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Groups.Cards", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Groups.Cards.Concept").
		Preload("Groups.Cards.Concept.Tradition").
		Where("DATE(date) <= DATE(?)", dateOnly).
		Order("date DESC").
		First(&puzzle).Error
	return &puzzle, err
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

// WithTx runs fn inside a DB transaction, handing it a repository bound to
// the transaction so callers can chain locked reads/writes atomically.
func (r *ConfluenceRepository) WithTx(fn func(txRepo *ConfluenceRepository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return fn(&ConfluenceRepository{db: tx})
	})
}

// GetOrCreateSessionForUpdate atomically creates the session row if it doesn't
// exist yet (ON CONFLICT DO NOTHING against the unique user_id+puzzle_id index,
// so two concurrent first guesses never race on a duplicate-key error) and then
// locks the row with SELECT ... FOR UPDATE so concurrent guess submissions for
// the same user+puzzle serialize instead of racing on a read-modify-write.
// Must be called with a repository bound to an active transaction (see WithTx).
func (r *ConfluenceRepository) GetOrCreateSessionForUpdate(userID, puzzleID uint) (*models.ConfluenceGameSession, error) {
	seed := models.ConfluenceGameSession{
		UserID:      userID,
		PuzzleID:    puzzleID,
		Status:      "in_progress",
		GroupsFound: models.UintSlice{},
		Attempts:    models.GuessLog{},
	}
	if err := r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&seed).Error; err != nil {
		return nil, err
	}

	var session models.ConfluenceGameSession
	err := r.db.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ? AND puzzle_id = ?", userID, puzzleID).
		First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
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
