package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"

	"github.com/resend/resend-go/v2"
)

// EmailSender is the interface used by handlers that need to send email.
// The concrete EmailService satisfies this interface; tests use a no-op stub.
type EmailSender interface {
	SendVerificationEmail(toEmail, username, token string) error
	SendPasswordResetEmail(toEmail, username, token string) error
}

// EmailService handles sending transactional emails via Resend
type EmailService struct {
	client      *resend.Client
	fromEmail   string
	frontendURL string
}

func NewEmailService(apiKey, fromEmail, frontendURL string) *EmailService {
	if apiKey == "" {
		log.Println("WARNING: RESEND_API_KEY is not set — all email sending will fail silently")
	} else {
		log.Printf("EmailService: RESEND_API_KEY is set (length=%d)", len(apiKey))
	}
	log.Printf("EmailService: from=%q  frontendURL=%q", fromEmail, frontendURL)

	return &EmailService{
		client:      resend.NewClient(apiKey),
		fromEmail:   fromEmail,
		frontendURL: frontendURL,
	}
}

// GenerateToken generates a cryptographically secure 64-character hex token
func GenerateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// SendVerificationEmail sends an email verification link to the user
func (s *EmailService) SendVerificationEmail(toEmail, username, token string) error {
	url := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, token)
	html := fmt.Sprintf(`<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#fafaf8;">
  <h2 style="color:#2c2c2c;">Verify Your Email — Daily Stoic</h2>
  <p>Hi <strong>%s</strong>, thank you for joining. Please verify your email address to begin your daily practice:</p>
  <a href="%s" style="display:inline-block;background:#2c2c2c;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;margin:16px 0;font-family:Georgia,serif;">Verify Email Address</a>
  <p style="color:#6b7280;font-size:14px;">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
  <p style="color:#6b7280;font-size:12px;">If the button doesn't work, copy and paste this link:<br>%s</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="color:#9ca3af;font-size:12px;">Daily Stoic — Ancient Wisdom for Modern Life</p>
</div>`, username, url, url)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: "Verify your email — Daily Stoic",
		Html:    html,
	})
	return err
}

// SendPasswordResetEmail sends a password reset link to the user
func (s *EmailService) SendPasswordResetEmail(toEmail, username, token string) error {
	url := fmt.Sprintf("%s/reset-password?token=%s", s.frontendURL, token)
	html := fmt.Sprintf(`<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#fafaf8;">
  <h2 style="color:#2c2c2c;">Reset Your Password — Daily Stoic</h2>
  <p>Hi <strong>%s</strong>, we received a request to reset your password:</p>
  <a href="%s" style="display:inline-block;background:#2c2c2c;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;margin:16px 0;font-family:Georgia,serif;">Reset Password</a>
  <p style="color:#6b7280;font-size:14px;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
  <p style="color:#6b7280;font-size:12px;">If the button doesn't work, copy and paste this link:<br>%s</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="color:#9ca3af;font-size:12px;">Daily Stoic — Ancient Wisdom for Modern Life</p>
</div>`, username, url, url)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: "Reset your password — Daily Stoic",
		Html:    html,
	})
	return err
}
