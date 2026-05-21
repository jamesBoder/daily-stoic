// Create oauth service

package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"golang.org/x/oauth2"
)

// init OAuthService
type OAuthService struct {
	userRepo     repository.UserRepository
	tokenService *TokenService
	oauthConfig  *oauth2.Config
}

// constructor
// NewOAuthService creates a new instance of OAuthService
func NewOAuthService(userRepo repository.UserRepository, tokenService *TokenService, config *oauth2.Config) *OAuthService {
	return &OAuthService{
		userRepo:     userRepo,
		tokenService: tokenService,
		oauthConfig:  config,
	}
}

// GetGoogleLoginURL generates URL to redirect user to Google OAuth consent page
func (s *OAuthService) GetGoogleLoginURL(state string) string {
	return s.oauthConfig.AuthCodeURL(state)
}

// HandleGoogleCallback processes the OAuth callback from Google
func (s *OAuthService) HandleGoogleCallback(code string) (*models.User, string, error) {
	// Exchange code for token
	token, err := s.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, "", fmt.Errorf("failed to exchange token: %w", err)
	}

	// Fetch user info from Google
	client := s.oauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, "", fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read user info response: %w", err)
	}

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
		Name    string `json:"name"`
	}
	if err := json.Unmarshal(body, &googleUser); err != nil {
		return nil, "", fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	// Check if user exists by Google ID
	user, err := s.userRepo.GetByGoogleID(googleUser.ID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to check Google ID: %w", err)
	}

	if user != nil {
		// Path 3: Existing Google user — update their info and ensure verified
		user.GoogleEmail = &googleUser.Email
		user.GooglePicture = &googleUser.Picture
		user.IsGoogleLinked = true
		user.EmailVerified = true
		if err := s.userRepo.Update(user); err != nil {
			return nil, "", fmt.Errorf("failed to update user: %w", err)
		}
	} else {
		// Check if email already exists (user signed up with email/password)
		existingUser, _ := s.userRepo.GetByEmail(googleUser.Email)
		if existingUser != nil {
			// Path 2: Email exists — link Google to existing account + mark verified
			existingUser.GoogleID = &googleUser.ID
			existingUser.GoogleEmail = &googleUser.Email
			existingUser.GooglePicture = &googleUser.Picture
			existingUser.IsGoogleLinked = true
			existingUser.EmailVerified = true
			if err := s.userRepo.Update(existingUser); err != nil {
				return nil, "", fmt.Errorf("failed to link Google account: %w", err)
			}
			user = existingUser
		} else {
			// Path 1: Create new Google user — pre-verified
			username, err := s.generateUsername(googleUser.Email)
			if err != nil {
				return nil, "", fmt.Errorf("failed to generate username: %w", err)
			}

			user = &models.User{
				Email:          googleUser.Email,
				Username:       username,
				Password:       "", // No password for OAuth-only users
				GoogleID:       &googleUser.ID,
				GoogleEmail:    &googleUser.Email,
				GooglePicture:  &googleUser.Picture,
				IsGoogleLinked: true,
				EmailVerified:  true,
			}
			if err := s.userRepo.Create(user); err != nil {
				return nil, "", fmt.Errorf("failed to create user: %w", err)
			}
		}
	}
	// Generate JWT token for the user
	jwtToken, err := s.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate JWT token: %w", err)
	}

	return user, jwtToken, nil
}

// LinkGoogleAccount links a Google account to an existing user
func (s *OAuthService) LinkGoogleAccount(userID uint, googleID string, googleEmail string, google_picture string) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	// check if Google ID is already linked to another account
	existingUser, err := s.userRepo.GetByGoogleID(googleID)
	if err != nil {
		return fmt.Errorf("failed to check existing Google ID: %w", err)
	}
	if existingUser != nil && existingUser.ID != userID {
		return fmt.Errorf("google account already linked to another user")
	}

	// Path 4: Link Google account to existing user — mark as verified
	user.GoogleID = &googleID
	user.IsGoogleLinked = true
	user.GoogleEmail = &googleEmail
	user.GooglePicture = &google_picture
	user.EmailVerified = true

	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to link Google account: %w", err)
	}

	return nil
}

// UnlinkGoogleAccount remove google link from account
func (s *OAuthService) UnlinkGoogleAccount(userID uint) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	// safety check: ensure user has a password set before unlinking
	if user.Password == "" {
		return fmt.Errorf("cannot unlink Google account: no password set")
	}

	// remove Google link
	if err := s.userRepo.RemoveGoogleLink(userID); err != nil {
		return fmt.Errorf("failed to unlink Google account: %w", err)
	}

	return nil
}

// generateUsername creates a unique username from email
func (s *OAuthService) generateUsername(email string) (string, error) {
	// Extract username from email (before @)
	parts := strings.Split(email, "@")
	if len(parts) == 0 {
		return "", errors.New("invalid email format")
	}

	baseUsername := parts[0]
	username := baseUsername

	// Check if username exists, if so, add number suffix
	counter := 1
	for {
		existingUser, _ := s.userRepo.GetByUsername(username)
		if existingUser == nil {
			break // Username is available
		}
		username = fmt.Sprintf("%s%d", baseUsername, counter)
		counter++
	}

	return username, nil
}
