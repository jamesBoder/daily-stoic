package repository

import (
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

const FreeQuestionLimit = 3

type AIUsageRepository struct {
	db *gorm.DB
}

func NewAIUsageRepository(db *gorm.DB) *AIUsageRepository {
	return &AIUsageRepository{db: db}
}

// today returns the current UTC date as "YYYY-MM-DD".
func today() string {
	return time.Now().UTC().Format("2006-01-02")
}

// TryConsume atomically checks and increments the daily question count for a free user.
// It returns (allowed=true, remaining) if the user is under the limit, or (allowed=false, 0)
// if already at limit. No separate check-then-act race condition — the DB does this in one step.
//
// Strategy: try UPDATE ... WHERE count < limit RETURNING count.
// If no row matched (either doesn't exist OR already at limit), try INSERT (first question today).
// If INSERT also returns nothing, the user was already at limit.
func (r *AIUsageRepository) TryConsume(userID uint) (allowed bool, remaining int, err error) {
	date := today()

	// Step 1: try to increment an existing row that is still under the limit.
	var newCount int
	row := r.db.Raw(`
		UPDATE ai_usages
		SET count = count + 1
		WHERE user_id = ? AND usage_date = ? AND count < ?
		RETURNING count
	`, userID, date, FreeQuestionLimit).Row()

	if scanErr := row.Scan(&newCount); scanErr == nil {
		// Row existed and was under the limit — increment succeeded.
		return true, FreeQuestionLimit - newCount, nil
	}

	// Step 2: row didn't exist yet — try to insert (first question today).
	insertRow := r.db.Raw(`
		INSERT INTO ai_usages (user_id, usage_date, count)
		VALUES (?, ?, 1)
		ON CONFLICT (user_id, usage_date) DO NOTHING
		RETURNING count
	`, userID, date).Row()

	if scanErr := insertRow.Scan(&newCount); scanErr == nil {
		// First question today — inserted successfully.
		return true, FreeQuestionLimit - newCount, nil
	}

	// Both UPDATE and INSERT returned nothing: the row exists with count >= limit.
	return false, 0, nil
}

// GetCount returns how many questions this user has asked today (UTC).
// Used only for the usage status endpoint — not in the request hot path.
func (r *AIUsageRepository) GetCount(userID uint) (int, error) {
	var usage models.AIUsage
	err := r.db.Where("user_id = ? AND usage_date = ?", userID, today()).First(&usage).Error
	if err == gorm.ErrRecordNotFound {
		return 0, nil
	}
	return usage.Count, err
}
