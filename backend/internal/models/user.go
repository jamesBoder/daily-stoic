package models

import (
	"errors"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/password"

	"gorm.io/gorm"
)

type User struct {
	// GORM base fields for ID, timestamps, and soft delete
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Your existing fields (add GORM tags)
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Username string `gorm:"size:50" json:"username"`
	Password string `json:"-"`

	// Google OAuth fields
	GoogleID       *string `gorm:"uniqueIndex:idx_users_google_id,where:google_id IS NOT NULL" json:"google_id,omitempty"`
	GoogleEmail    *string `json:"google_email,omitempty"`
	GooglePicture  *string `json:"google_picture,omitempty"`
	IsGoogleLinked bool    `json:"is_google_linked"`

	// Email verification
	EmailVerified              bool       `gorm:"default:false" json:"email_verified"`
	VerificationToken          *string    `gorm:"size:128" json:"-"`
	VerificationTokenExpiresAt *time.Time `json:"-"`

	// Password reset
	ResetToken          *string    `gorm:"size:128" json:"-"`
	ResetTokenExpiresAt *time.Time `json:"-"`

	// User preferences
	PreferredLanguage string `gorm:"size:10;default:'en'" json:"preferred_language"`

	// Relationships (if you want to preload)
	Favorites []Favorite `gorm:"foreignKey:UserID" json:"favorites,omitempty"`
	History   []History  `gorm:"foreignKey:UserID" json:"history,omitempty"`
}

// create SetPassword method
func (u *User) SetPassword(pwd string) error {
	// validate hashed password is not empty
	if pwd == "" {
		return errors.New("password cannot be empty")
	}

	// validate password strength
	if valid, err := password.ValidatePasswordStrength(pwd); !valid {
		return errors.New("password does not meet strength requirements: " + err.Error())
	}

	// call hashPassword function to hash password
	hashedPassword, err := password.HashPassword(pwd)
	// validate password strength
	u.Password = hashedPassword
	return err
}

// create CheckPassword method
func (u *User) CheckPassword(pwd string) bool {
	// compare password with hashed password
	// return true if match, false otherwise
	return password.CheckPasswordHash(pwd, u.Password)
}

// create BeforeCreate hook to hash password
func (u *User) BeforeCreate(tx *gorm.DB) error {
	// Skip password validation for OAuth users (they don't need a password)
	if u.GoogleID != nil && *u.GoogleID != "" && u.Password == "" {
		return nil
	}

	// For non-OAuth users, password is required
	if u.Password == "" {
		return errors.New("password cannot be empty")
	}

	// Hash the password
	return u.SetPassword(u.Password)
}

// create BeforeUpdate hook to hash password
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	// skip hashing for Oauth users
	if u.Password == "" || (u.GoogleID != nil && *u.GoogleID != "") {
		return nil
	}
	// Only hash password if it has been changed
	// This prevents re-hashing an already-hashed password when updating other fields
	if tx.Statement.Changed("Password") {
		// Check if the password looks like it's already hashed (bcrypt hashes start with $2a$ or $2b$)
		// If it's already hashed, skip hashing again
		if len(u.Password) > 0 && (u.Password[:4] == "$2a$" || u.Password[:4] == "$2b$") {
			return nil
		}
		return u.SetPassword(u.Password)
	}
	return nil
}
