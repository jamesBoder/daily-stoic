package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

type AiHandler struct {
	aiSvc       *services.AiService
	aiUsageRepo *repository.AIUsageRepository
	quoteRepo   *repository.QuoteRepository
	authorRepo  *repository.AuthorRepository
}

func NewAiHandler(
	aiSvc *services.AiService,
	aiUsageRepo *repository.AIUsageRepository,
	quoteRepo *repository.QuoteRepository,
	authorRepo *repository.AuthorRepository,
) *AiHandler {
	return &AiHandler{
		aiSvc:       aiSvc,
		aiUsageRepo: aiUsageRepo,
		quoteRepo:   quoteRepo,
		authorRepo:  authorRepo,
	}
}

type askRequest struct {
	Question string `json:"question" binding:"required,min=3,max=500"`
}

type askResponse struct {
	Response           string `json:"response"`
	QuestionsRemaining *int   `json:"questions_remaining"` // null = unlimited (premium)
}

// AskByQuote handles POST /api/quotes/:id/ask
// The quote provides context (author, source, text). Free users: 3/day. Premium: unlimited.
func (h *AiHandler) AskByQuote(c *gin.Context) {
	userID, isPremium, ok := authContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	quoteID, err := parseUint(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quote id"})
		return
	}

	var req askRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "question is required (3–500 characters)"})
		return
	}

	// Rate limit: atomically consume a slot before calling AI (no race condition).
	var remaining *int
	if !isPremium {
		allowed, rem, err := h.aiUsageRepo.TryConsume(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not check usage limit"})
			return
		}
		if !allowed {
			zero := 0
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               "You've reached today's limit. The philosopher will await your return tomorrow.",
				"questions_remaining": zero,
			})
			return
		}
		remaining = &rem
	}

	quote, err := h.quoteRepo.GetByID(quoteID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "quote not found"})
		return
	}

	response, err := h.aiSvc.Ask(quote, req.Question)
	if err != nil {
		log.Printf("AskByQuote error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "the philosopher is unavailable right now"})
		return
	}

	c.JSON(http.StatusOK, askResponse{Response: response, QuestionsRemaining: remaining})
}

// AskByAuthor handles POST /api/authors/:slug/ask
// Used from the ConversePage and AuthorPage when no specific quote is selected.
func (h *AiHandler) AskByAuthor(c *gin.Context) {
	userID, isPremium, ok := authContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	slug := c.Param("slug")

	var req askRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "question is required (3–500 characters)"})
		return
	}

	// Rate limit: atomically consume a slot before calling AI.
	var remaining *int
	if !isPremium {
		allowed, rem, err := h.aiUsageRepo.TryConsume(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not check usage limit"})
			return
		}
		if !allowed {
			zero := 0
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               "You've reached today's limit. The philosopher will await your return tomorrow.",
				"questions_remaining": zero,
			})
			return
		}
		remaining = &rem
	}

	author, err := h.authorRepo.GetBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "author not found"})
		return
	}

	response, err := h.aiSvc.AskByAuthor(author, req.Question)
	if err != nil {
		log.Printf("AskByAuthor error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "the philosopher is unavailable right now"})
		return
	}

	c.JSON(http.StatusOK, askResponse{Response: response, QuestionsRemaining: remaining})
}

// GetAiUsage handles GET /api/ai/usage — returns today's question count for the current user.
func (h *AiHandler) GetAiUsage(c *gin.Context) {
	userID, isPremium, ok := authContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if isPremium {
		c.JSON(http.StatusOK, gin.H{
			"questions_used":      nil,
			"questions_remaining": nil,
			"is_unlimited":        true,
		})
		return
	}

	count, err := h.aiUsageRepo.GetCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch usage"})
		return
	}

	remaining := repository.FreeQuestionLimit - count
	if remaining < 0 {
		remaining = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"questions_used":      count,
		"questions_remaining": remaining,
		"is_unlimited":        false,
	})
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// authContext extracts userID and isPremium from the Gin context set by auth
// middleware. Returns false if userID is missing or the wrong type — callers
// must abort the request in that case.
func authContext(c *gin.Context) (userID uint, isPremium bool, ok bool) {
	uid, exists := c.Get("userID")
	if !exists {
		return 0, false, false
	}
	userID, ok = uid.(uint)
	if !ok {
		return 0, false, false
	}
	if p, exists := c.Get("isPremium"); exists {
		if v, ok := p.(bool); ok {
			isPremium = v
		}
	}
	return userID, isPremium, true
}

func parseUint(s string) (uint, error) {
	v, err := strconv.ParseUint(s, 10, 64)
	return uint(v), err
}
