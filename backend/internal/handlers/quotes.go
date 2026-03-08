package handlers

import (
	"net/http"
	"strconv"

	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
	"github.com/gin-gonic/gin"
)

type QuoteHandler struct {
	quoteRepo     *repository.QuoteRepository
	authorRepo    *repository.AuthorRepository
	dailyQuoteSvc *services.DailyQuoteService
	streakSvc     *services.StreakService
}

func NewQuoteHandler(
	quoteRepo *repository.QuoteRepository,
	authorRepo *repository.AuthorRepository,
	dailyQuoteSvc *services.DailyQuoteService,
	streakSvc *services.StreakService,
) *QuoteHandler {
	return &QuoteHandler{
		quoteRepo:     quoteRepo,
		authorRepo:    authorRepo,
		dailyQuoteSvc: dailyQuoteSvc,
		streakSvc:     streakSvc,
	}
}

// GET /api/quotes/daily
func (h *QuoteHandler) GetDailyQuote(c *gin.Context) {
	quote, err := h.dailyQuoteSvc.GetDailyQuote()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve daily quote"})
		return
	}

	response := gin.H{"quote": quote}

	// If authenticated, record streak and attach streak info to response
	if userID, exists := c.Get("userID"); exists {
		uid := userID.(uint)
		streak, newBadges, err := h.streakSvc.RecordDailyRead(uid)
		if err == nil {
			response["streak"] = streak
			if len(newBadges) > 0 {
				response["new_achievements"] = newBadges
			}
		}
	}

	c.JSON(http.StatusOK, response)
}

// GET /api/quotes/:id
func (h *QuoteHandler) GetQuoteByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid quote ID"})
		return
	}
	quote, err := h.quoteRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quote not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"quote": quote})
}

// GET /api/quotes/search?q=&tradition=&theme=&tier=&limit=&offset=
func (h *QuoteHandler) SearchQuotes(c *gin.Context) {
	q := c.Query("q")
	tradition := c.Query("tradition")
	theme := c.Query("theme")
	tier := c.Query("tier")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	quotes, total, err := h.quoteRepo.Search(q, tradition, theme, tier, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"quotes": quotes,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GET /api/quotes/by-author/:authorId
func (h *QuoteHandler) GetQuotesByAuthor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("authorId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid author ID"})
		return
	}
	quotes, err := h.quoteRepo.GetByAuthor(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve quotes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"quotes": quotes})
}

// GET /api/authors
func (h *QuoteHandler) ListAuthors(c *gin.Context) {
	authors, err := h.authorRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve authors"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"authors": authors})
}
