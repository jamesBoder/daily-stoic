package handlers

// imports

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/go-playground/validator/v10"
	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/password"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

// ProfileHandler struct

type ProfileHandler struct {
	userRepo            repository.UserRepository
	favoriteRepo        repository.FavoriteRepository
	historyRepo         repository.HistoryRepository
	commentRepo         *repository.CommentRepository
	passwordHistoryRepo repository.PasswordHistoryRepository
	streakRepo          repository.StreakRepository
	emailService        services.EmailSender
	emailValidator      *services.EmailValidationService
	streakSvc           *services.StreakService
	validator           *validator.Validate
}

// constructor init handler with dependencies

func NewProfileHandler(
	userRepo repository.UserRepository,
	favoriteRepo repository.FavoriteRepository,
	historyRepo repository.HistoryRepository,
	commentRepo *repository.CommentRepository,
	passwordHistoryRepo repository.PasswordHistoryRepository,
	streakRepo repository.StreakRepository,
	emailService services.EmailSender,
	emailValidator *services.EmailValidationService,
	streakSvc *services.StreakService,
	validator *validator.Validate,
) *ProfileHandler {
	return &ProfileHandler{
		userRepo:            userRepo,
		favoriteRepo:        favoriteRepo,
		historyRepo:         historyRepo,
		commentRepo:         commentRepo,
		passwordHistoryRepo: passwordHistoryRepo,
		streakRepo:          streakRepo,
		emailService:        emailService,
		emailValidator:      emailValidator,
		streakSvc:           streakSvc,
		validator:           validator,
	}
}

// GetUserStreak returns the current streak and points for the authenticated user.
// GET /api/profile/streak
func (h *ProfileHandler) GetUserStreak(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	streak, err := h.streakSvc.GetStreak(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve streak"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"streak": streak})
}

// GetUserAchievements returns all earned achievement badges for the authenticated user.
// GET /api/profile/achievements
func (h *ProfileHandler) GetUserAchievements(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	achievements, err := h.streakRepo.GetAchievements(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve achievements"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"achievements": achievements})
}

// ResendVerification is an alias for ResendVerificationFromProfile, used in profile routes.
func (h *ProfileHandler) ResendVerification(c *gin.Context) {
	h.ResendVerificationFromProfile(c)
}

// GetProfile handler
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// fetch user from userRepo
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// respond with user profile data
	c.JSON(http.StatusOK, gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"email":            user.Email,
		"created_at":       user.CreatedAt,
		"email_verified":   user.EmailVerified,
		"google_id":        getStringValue(user.GoogleID),
		"google_email":     getStringValue(user.GoogleEmail),
		"google_picture":   getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	})
}

// UpdateProfile handler
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		Username string `json:"username" validate:"required,min=3,max=50"`
		Email    string `json:"email" validate:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// validate email (check for disposable domains and typos)
	isValid, suggestion, errMsg := h.emailValidator.ValidateEmail(req.Email)
	if !isValid {
		response := gin.H{
			"error": errMsg,
			"field": "email",
		}
		if suggestion != "" {
			response["suggestion"] = suggestion
		}
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// check if user exists
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if email is being changed and if it's already taken by another user
	if req.Email != user.Email {
		existingUser, _ := h.userRepo.GetByEmail(req.Email)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
			return
		}
	}

	// Check if username is being changed and if it's already taken by another user
	if req.Username != user.Username {
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already in use"})
			return
		}
	}

	// Detect email change before updating
	emailChanged := req.Email != user.Email

	// update user via userRepo.Update()
	user.Username = req.Username
	user.Email = req.Email

	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// If email changed, reset verification and send new verification email
	if emailChanged {
		token, err := services.GenerateToken()
		if err != nil {
			log.Printf("Failed to generate verification token after email change for user %d: %v", user.ID, err)
		} else {
			if err := h.userRepo.UpdateVerificationToken(user.ID, token, time.Now().Add(24*time.Hour)); err != nil {
				log.Printf("Failed to store verification token after email change for user %d: %v", user.ID, err)
			} else {
				if err := h.emailService.SendVerificationEmail(user.Email, user.Username, token); err != nil {
					log.Printf("Failed to send verification email to %s: %v", user.Email, err)
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"id":               user.ID,
			"username":         user.Username,
			"email":            user.Email,
			"created_at":       user.CreatedAt,
			"email_verified":   false,
			"google_id":        getStringValue(user.GoogleID),
			"google_email":     getStringValue(user.GoogleEmail),
			"google_picture":   getStringValue(user.GooglePicture),
			"is_google_linked": user.IsGoogleLinked,
			"message":          "Profile updated. A verification email has been sent to your new address.",
		})
		return
	}

	// respond with updated profile data (no email change)
	c.JSON(http.StatusOK, gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"email":            user.Email,
		"created_at":       user.CreatedAt,
		"email_verified":   user.EmailVerified,
		"google_id":        getStringValue(user.GoogleID),
		"google_email":     getStringValue(user.GoogleEmail),
		"google_picture":   getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	})
}

// GetStats handler
func (h *ProfileHandler) GetStats(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// count favorite favoriteRepo.CountByUserID
	favCount, err := h.favoriteRepo.CountByUserID(userID.(uint))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite count"})
		return
	}

	// count history: historyRepo.CountByUserID
	histCount, err := h.historyRepo.CountByUserID(userID.(uint))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history count"})
		return
	}

	// count comments: commentRepo.CountByUserID
	commentCount, err := h.commentRepo.CountByUserID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comment count"})
		return
	}

	// calculate account age: time.Since(user.CreatedAt)
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	accountAge := int64((time.Since(user.CreatedAt)).Hours() / 24) // in days

	// respond with stats
	c.JSON(http.StatusOK, gin.H{
		"favorite_count":   favCount,
		"history_count":    histCount,
		"comment_count":    commentCount,
		"account_age_days": accountAge,
	})
}

// SetPassword handler - allows OAuth users to set their first password
func (h *ProfileHandler) SetPassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		NewPassword     string `json:"newPassword" validate:"required,min=8"`
		ConfirmPassword string `json:"confirmPassword" validate:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// check if passwords match
	if req.NewPassword != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
		return
	}

	// fetch user from database
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// check if user already has a password
	if user.Password != "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password already set",
			"details": "Use the change password feature to update your existing password",
		})
		return
	}

	// validate new password strength
	validPassword, err := password.ValidatePasswordStrength(req.NewPassword)
	if !validPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password does not meet requirements",
			"details": err.Error(),
		})
		return
	}

	// set password (SetPassword will hash it)
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set password"})
		return
	}

	// save to database
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	// save to password history
	passwordHistory := &models.PasswordHistory{
		UserID:       userID.(uint),
		PasswordHash: user.Password,
		ChangedAt:    time.Now(),
	}
	if err := h.passwordHistoryRepo.Create(passwordHistory); err != nil {
		// Log error but don't fail the request
		// Password was successfully set, history is not critical
	}

	// respond with success
	c.JSON(http.StatusOK, gin.H{
		"message": "Password set successfully. You can now unlink your Google account if desired.",
	})
}

// UpdatePassword handler - allows users to change their password
func (h *ProfileHandler) UpdatePassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		CurrentPassword string `json:"currentPassword" validate:"required"`
		NewPassword     string `json:"newPassword" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// fetch user from database
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// check if user is OAuth-only (no password set)
	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Cannot change password for OAuth-only accounts",
			"details": "Please set a password first or continue using Google login",
		})
		return
	}

	// verify current password
	if !user.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	// validate new password strength
	validPassword, err := password.ValidatePasswordStrength(req.NewPassword)
	if !validPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "New password does not meet requirements",
			"details": err.Error(),
		})
		return
	}

	// check if new password is same as current password
	if req.CurrentPassword == req.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password must be different from current password"})
		return
	}

	// check password history - prevent reuse of last 5 passwords
	const passwordHistoryLimit = 5
	recentPasswords, err := h.passwordHistoryRepo.GetRecentByUserID(userID.(uint), passwordHistoryLimit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check password history"})
		return
	}

	// check if new password matches any recent passwords
	for _, historyEntry := range recentPasswords {
		if password.CheckPasswordHash(req.NewPassword, historyEntry.PasswordHash) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Cannot reuse recent passwords",
				"details": "This password was used recently. Please choose a different password.",
			})
			return
		}
	}

	// save current password to history before updating
	passwordHistory := &models.PasswordHistory{
		UserID:       userID.(uint),
		PasswordHash: user.Password, // Save current (old) password hash
		ChangedAt:    time.Now(),
	}
	if err := h.passwordHistoryRepo.Create(passwordHistory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password history"})
		return
	}

	// update password (SetPassword will hash it)
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// save to database
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	// clean up old password history entries (keep only last 5)
	if err := h.passwordHistoryRepo.DeleteOldestForUser(userID.(uint), passwordHistoryLimit); err != nil {
		// Log error but don't fail the request
		// Password was successfully changed, cleanup is not critical
	}

	// respond with success
	c.JSON(http.StatusOK, gin.H{
		"message": "Password updated successfully",
	})
}

// DeleteAccount permanently deletes the authenticated user's account.
// Requires password confirmation (or skips it for OAuth-only accounts).
func (h *ProfileHandler) DeleteAccount(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Password string `json:"password"`
	}
	// Best-effort parse — password may be empty for OAuth-only accounts
	_ = c.ShouldBindJSON(&req)

	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// If the account has a password set, require it for confirmation.
	if user.Password != "" {
		if req.Password == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password is required to delete your account"})
			return
		}
		if !user.CheckPassword(req.Password) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect password"})
			return
		}
	}

	if err := h.userRepo.Delete(userID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
}

// ResendVerificationFromProfile sends a new verification email for the currently
// authenticated user. Protected route — requires valid JWT.
func (h *ProfileHandler) ResendVerificationFromProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.EmailVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already verified"})
		return
	}

	token, err := services.GenerateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}

	if err := h.userRepo.UpdateVerificationToken(user.ID, token, time.Now().Add(24*time.Hour)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store verification token"})
		return
	}

	if err := h.emailService.SendVerificationEmail(user.Email, user.Username, token); err != nil {
		log.Printf("Failed to send verification email to %s: %v", user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification email sent. Please check your inbox.",
	})
}
