package services

// TokenService handles token generation and validation

import (
	"time"
	"fmt"
	
	"github.com/jamesBoder/daily-stoic/internal/config"
	"github.com/golang-jwt/jwt/v5"

)

// define TokenClaims struct
type TokenClaims struct {
	UserID    uint
	Email	  string
	jwt.RegisteredClaims
}

// define TokenService interface
type TokenService struct {
	config *config.Config
}


// create NewTokenService constructor
func NewTokenService(cfg *config.Config) *TokenService {
	return &TokenService{config: cfg}
}


// create GenerateToken method
func (tc *TokenService) GenerateToken(userid uint, email string) (string, error) {
	
	// Set the token expiration time
	expirationTime := time.Now().Add(168 * time.Hour) 

	// Create the JWT claims, which includes the user ID and expiry time
	claims := &TokenClaims{
		UserID: userid,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	
	// Declare the token with the algorithm used for signing, and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Create the JWT string
	tokenString, err := token.SignedString([]byte(tc.config.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// create ValidateToken method
func (tc *TokenService) ValidateToken(tokenString string) (*TokenClaims, error) {
	// Parse the JWT string and store the result in `claims`.
	claims := &TokenClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(tc.config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// RefreshToken Method
func (tc *TokenService) RefreshToken(tokenString string) (string, error) {
	claims, err := tc.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	// Create a new token for the user with a renewed expiration time
	return tc.GenerateToken(claims.UserID, claims.Email)
}





