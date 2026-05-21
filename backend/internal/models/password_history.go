package models

import (
	"gorm.io/gorm"
	"time"
)

// PasswordHistory stores historical passwords for users to prevent reuse
type PasswordHistory struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Foreign key to User
	UserID uint `gorm:"not null;index" json:"user_id"`

	// Hashed password (stored for comparison)
	PasswordHash string `gorm:"not null" json:"-"`

	// When this password was set
	ChangedAt time.Time `gorm:"not null" json:"changed_at"`
}

// TableName specifies the table name for PasswordHistory
func (PasswordHistory) TableName() string {
	return "password_history"
}
