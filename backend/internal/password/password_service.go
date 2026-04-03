package password

import (

	"fmt"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const (
	// Define any password policy constants here
	MinPasswordLength = 8
	BcryptCost       = 12
)

// password hashing function
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// password comparison function
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// password validation function
func ValidatePasswordStrength(password string) (bool, error) {
	// checks for minimum length
	if len(password) < MinPasswordLength {
		return false, errors.New(fmt.Sprintf("Password must be at least %d characters long", MinPasswordLength))
	}

	// checks for uppercase, lowercase, digit, special character
	var hasUpper, hasLower, hasDigit, hasSpecial bool

	for _, char := range password {
		switch {
		case 'A' <= char && char <= 'Z':
			hasUpper = true
		case 'a' <= char && char <= 'z':
			hasLower = true
		case '0' <= char && char <= '9':
			hasDigit = true
		case (char >= 33 && char <= 47) || (char >= 58 && char <= 64) ||
			(char >= 91 && char <= 96) || (char >= 123 && char <= 126):
			hasSpecial = true
		}
	}

	if !hasUpper || !hasLower || !hasDigit || !hasSpecial {
		return false, errors.New("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
	}

	return true, nil
	
}

