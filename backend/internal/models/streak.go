package models

import "time"

// UserStreak tracks the reading habit streak for a user.
// Points awarded per day depend on the current streak tier (see StreakService).
type UserStreak struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	CurrentStreak int       `gorm:"default:0" json:"current_streak"`
	LongestStreak int       `gorm:"default:0" json:"longest_streak"`
	TotalPoints   int       `gorm:"default:0" json:"total_points"`
	LastReadDate  *string   `gorm:"type:date" json:"last_read_date,omitempty"` // "2026-03-07"
	UpdatedAt     time.Time `json:"updated_at"`
}
