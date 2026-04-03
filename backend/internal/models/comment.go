package models

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	UserID      uint   `gorm:"not null;index" json:"user_id"`
	QuoteID     uint   `gorm:"not null;index" json:"quote_id"`
	CommentText string `gorm:"type:text;not null" json:"comment_text"`

	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Quote Quote `gorm:"foreignKey:QuoteID" json:"quote,omitempty"`
}
