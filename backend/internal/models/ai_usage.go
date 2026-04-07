package models

// AIUsage tracks per-user daily question counts for the Ask the Philosopher feature.
// Free users are limited to 3 questions/day; lifetime users are unlimited.
// UsageDate is stored as "YYYY-MM-DD" (UTC) so no timezone ambiguity.
type AIUsage struct {
	UserID    uint   `gorm:"primaryKey;column:user_id"`
	UsageDate string `gorm:"primaryKey;column:usage_date;type:date"`
	Count     int    `gorm:"column:count;not null;default:0"`
}
