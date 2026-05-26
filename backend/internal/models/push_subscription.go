package models

import "time"

type PushSubscription struct {
	ID        uint      `gorm:"primaryKey"                     json:"id"`
	UserID    uint      `gorm:"index;not null"                 json:"user_id"`
	Endpoint  string    `gorm:"size:2048;uniqueIndex;not null" json:"endpoint"`
	Auth      string    `gorm:"size:512;not null"              json:"-"`
	P256DH    string    `gorm:"size:512;not null"              json:"-"`
	CreatedAt time.Time `                                       json:"created_at"`
}
