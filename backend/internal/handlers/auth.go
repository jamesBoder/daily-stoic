package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/password"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	userRepo            repository.UserRepository
	tokenService        *services.TokenService
	emailValidator      *services.EmailValidationService
	emailService        services.EmailSender
	passwordHistoryRepo repository.PasswordHistoryRepository
	validator           *validator.Validate
}

// NewAuthHandler creates a new AuthHandler with all required dependencies
func NewAuthHandler(
	userRepo repository.UserRepository,
	tokenService *services.TokenService,
	emailValidator *services.EmailValidationService,
	emailService services.EmailSender,
	passwordHistoryRepo repository.PasswordHistoryRepository,
) *AuthHandler {
	return &AuthHandler{
		userRepo:            userRepo,
		tokenService:        tokenService,
		emailValidator:      emailValidator,
		emailService:        emailService,
		passwordHistoryRepo: passwordHistoryRepo,
		validator:           validator.New(),
	}
}

// UserResponse is the standard user object returned in API responses
type UserResponse struct {
	ID             uint      `json:"id"`
	Email          string    `json:"email"`
	Username       string    `json:"username"`
	CreatedAt      time.Time `json:"created_at"`
	EmailVerified  bool      `json:"email_verified"`
	GoogleID       string    `json:"google_id,omitempty"`
	GoogleEmail    string    `json:"google_email,omitempty"`
	GooglePicture  string    `json:"google_picture,omitempty"`
	IsGoogleLinked bool      `json:"is_google_linked"`
}

// buildUserResponse constructs a UserResponse from a User model
func buildUserResponse(user *models.User) UserResponse {
	return UserResponse{
		ID:             user.ID,
		Email:          user.Email,
		Username:       user.Username,
		CreatedAt:      user.CreatedAt,
		EmailVerified:  user.EmailVerified,
		GoogleID:       getStringValue(user.GoogleID),
		GoogleEmail:    getStringValue(user.GoogleEmail),
		GooglePicture:  getStringValue(user.GooglePicture),
		IsGoogleLinked: user.IsGoogleLinked,
	}
}

// ── Register ──────────────────────────────────────────────────────────────────

type RegisterRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Username string `json:"username" validate:"required,alphanum"`
	Password string `json:"password" validate:"required,min=8"`
}

// Register creates a new user account and sends a verification email.
// Returns HTTP 201 with a message only — no JWT (user must verify email first).
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		var errs []string
		for _, e := range err.(validator.ValidationErrors) {
			errs = append(errs, e.Field()+" is "+e.Tag())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errs})
		return
	}

	// Validate email (disposable / typo check)
	isValid, suggestion, errMsg := h.emailValidator.ValidateEmail(req.Email)
	if !isValid {
		resp := gin.H{"error": errMsg, "field": "email"}
		if suggestion != "" {
			resp["suggestion"] = suggestion
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	// Validate password strength
	if valid, err := password.ValidatePasswordStrength(req.Password); !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password validation failed",
			"details": err.Error(),
			"field":   "password",
		})
		return
	}

	// Check email uniqueness
	if existing, _ := h.userRepo.GetByEmail(req.Email); existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Check username uniqueness
	if existing, _ := h.userRepo.GetByUsername(req.Username); existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this username already exists"})
		return
	}

	// Create user (BeforeCreate hook hashes password; EmailVerified defaults false)
	newUser := &models.User{
		Email:    req.Email,
		Username: req.Username,
		Password: req.Password,
	}
	if err := h.userRepo.Create(newUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	// Generate and store verification token (24h expiry)
	token, err := services.GenerateToken()
	if err != nil {
		log.Printf("Failed to generate verification token for user %d: %v", newUser.ID, err)
	} else {
		if err := h.userRepo.UpdateVerificationToken(newUser.ID, token, time.Now().Add(24*time.Hour)); err != nil {
			log.Printf("Failed to store verification token for user %d: %v", newUser.ID, err)
		} else {
			// Send verification email — log error but don't fail the request
			if err := h.emailService.SendVerificationEmail(newUser.Email, newUser.Username, token); err != nil {
				log.Printf("Failed to send verification email to %s: %v", newUser.Email, err)
			}
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created! Please check your email to verify your account.",
	})
}

// ── Login ─────────────────────────────────────────────────────────────────────

type LoginRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// Login authenticates a user. Blocks unverified email/password accounts with
// HTTP 403 + machine-readable code "EMAIL_NOT_VERIFIED".
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		var errs []string
		for _, e := range err.(validator.ValidationErrors) {
			errs = append(errs, e.Field()+" is "+e.Tag())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errs})
		return
	}

	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !password.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Block login for unverified email/password accounts
	if !user.EmailVerified && !user.IsGoogleLinked {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Please verify your email before logging in.",
			"code":  "EMAIL_NOT_VERIFIED",
		})
		return
	}

	jwtToken, err := h.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		User:  buildUserResponse(user),
		Token: jwtToken,
	})
}

// ── Logout ────────────────────────────────────────────────────────────────────

// Logout is a no-op for stateless JWT — the client removes the token.
func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// ── GetMe ─────────────────────────────────────────────────────────────────────

type GetMeResponse struct {
	User UserResponse `json:"user"`
}

// GetMe returns the currently authenticated user's profile.
func (h *AuthHandler) GetMe(c *gin.Context) {
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

	c.JSON(http.StatusOK, GetMeResponse{User: buildUserResponse(user)})
}

// ── VerifyEmail ───────────────────────────────────────────────────────────────

type VerifyEmailRequest struct {
	Token string `json:"token" validate:"required"`
}

// VerifyEmail validates an email verification token, marks the user as verified,
// and returns a JWT for automatic login.
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	var req VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	user, err := h.userRepo.GetByVerificationToken(req.Token)
	if err != nil || user == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification link."})
		return
	}

	if user.VerificationTokenExpiresAt == nil || time.Now().After(*user.VerificationTokenExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Link has expired. Please request a new one."})
		return
	}

	// Mark as verified and clear token fields
	if err := h.userRepo.ClearVerificationToken(user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify email"})
		return
	}

	// Reload user to get updated EmailVerified = true
	user.EmailVerified = true

	jwtToken, err := h.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email verified!",
		"token":   jwtToken,
		"user":    buildUserResponse(user),
	})
}

// ── ResendVerification ────────────────────────────────────────────────────────

type ResendVerificationRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// ResendVerification sends a new verification email. Always returns a generic
// message to prevent user enumeration.
func (h *AuthHandler) ResendVerification(c *gin.Context) {
	genericMsg := gin.H{"message": "If your account exists and is unverified, a new verification email has been sent."}

	var req ResendVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	if user.EmailVerified {
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	token, err := services.GenerateToken()
	if err != nil {
		log.Printf("Failed to generate verification token for user %d: %v", user.ID, err)
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	if err := h.userRepo.UpdateVerificationToken(user.ID, token, time.Now().Add(24*time.Hour)); err != nil {
		log.Printf("Failed to store verification token for user %d: %v", user.ID, err)
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	if err := h.emailService.SendVerificationEmail(user.Email, user.Username, token); err != nil {
		log.Printf("Failed to send verification email to %s: %v", user.Email, err)
	}

	c.JSON(http.StatusOK, genericMsg)
}

// ── ForgotPassword ────────────────────────────────────────────────────────────

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// ForgotPassword sends a password reset email. Always returns a generic message
// to prevent user enumeration.
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	genericMsg := gin.H{"message": "If that email exists, we sent a password reset link."}

	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	// Google-only accounts have no password to reset
	if user.IsGoogleLinked && user.Password == "" {
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	token, err := services.GenerateToken()
	if err != nil {
		log.Printf("Failed to generate reset token for user %d: %v", user.ID, err)
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	if err := h.userRepo.UpdateResetToken(user.ID, token, time.Now().Add(1*time.Hour)); err != nil {
		log.Printf("Failed to store reset token for user %d: %v", user.ID, err)
		c.JSON(http.StatusOK, genericMsg)
		return
	}

	if err := h.emailService.SendPasswordResetEmail(user.Email, user.Username, token); err != nil {
		log.Printf("Failed to send password reset email to %s: %v", user.Email, err)
	}

	c.JSON(http.StatusOK, genericMsg)
}

// ── ResetPassword ─────────────────────────────────────────────────────────────

type ResetPasswordRequest struct {
	Token       string `json:"token"        validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

// ResetPassword validates a reset token and sets a new password.
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "new_password is required and must be at least 8 characters"})
		return
	}

	user, err := h.userRepo.GetByResetToken(req.Token)
	if err != nil || user == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset link."})
		return
	}

	if user.ResetTokenExpiresAt == nil || time.Now().After(*user.ResetTokenExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Link has expired. Please request a new password reset."})
		return
	}

	// Defensive check: Google-only accounts have no password to reset.
	// ForgotPassword already blocks these accounts from receiving a reset token,
	// but this guard ensures correctness even if that check is ever bypassed.
	if user.IsGoogleLinked && user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This account uses Google Sign-In. Password reset is not available. Please sign in with Google.",
		})
		return
	}

	// Validate new password strength
	if valid, err := password.ValidatePasswordStrength(req.NewPassword); !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password does not meet requirements",
			"details": err.Error(),
		})
		return
	}

	// Check password history — prevent reuse of last 5 passwords
	recentPasswords, err := h.passwordHistoryRepo.GetRecentByUserID(user.ID, 5)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check password history"})
		return
	}
	for _, entry := range recentPasswords {
		if password.CheckPasswordHash(req.NewPassword, entry.PasswordHash) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Cannot reuse recent passwords. Please choose a different password.",
			})
			return
		}
	}

	// Save current password to history before overwriting
	if err := h.passwordHistoryRepo.Create(&models.PasswordHistory{
		UserID:       user.ID,
		PasswordHash: user.Password,
		ChangedAt:    time.Now(),
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password history"})
		return
	}

	// Hash and set new password
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set new password"})
		return
	}

	// Save user (BeforeUpdate hook: password already starts with $2a$, skips re-hash)
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new password"})
		return
	}

	// Invalidate the reset token (single-use)
	if err := h.userRepo.ClearResetToken(user.ID); err != nil {
		log.Printf("Failed to clear reset token for user %d: %v", user.ID, err)
	}

	// Clean up old password history (keep only last 5)
	if err := h.passwordHistoryRepo.DeleteOldestForUser(user.ID, 5); err != nil {
		log.Printf("Failed to clean up password history for user %d: %v", user.ID, err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully. You can now log in.",
	})
}
