package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

type ConfluenceHandler struct {
	svc *services.ConfluenceService
}

func NewConfluenceHandler(svc *services.ConfluenceService) *ConfluenceHandler {
	return &ConfluenceHandler{svc: svc}
}

// GET /api/games/confluence/today
func (h *ConfluenceHandler) GetToday(c *gin.Context) {
	puzzle, err := h.svc.GetTodayPuzzle()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no puzzle available for today"})
		return
	}
	c.JSON(http.StatusOK, stripTeachings(puzzle))
}

// GET /api/games/confluence/date/:date  (format: 2026-05-01)
func (h *ConfluenceHandler) GetByDate(c *gin.Context) {
	date, err := time.Parse("2006-01-02", c.Param("date"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use YYYY-MM-DD"})
		return
	}
	puzzle, err := h.svc.GetPuzzleByDate(date)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no puzzle for that date"})
		return
	}
	c.JSON(http.StatusOK, stripTeachings(puzzle))
}

type guessRequest struct {
	CardIDs []uint `json:"card_ids" binding:"required,len=4"`
}

// POST /api/games/confluence/:id/guess  (auth required)
func (h *ConfluenceHandler) SubmitGuess(c *gin.Context) {
	userID, _ := authContext(c)

	puzzleID, err := parseUint(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid puzzle id"})
		return
	}

	var req guessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "must provide exactly 4 card_ids"})
		return
	}

	result, err := h.svc.SubmitGuess(userID, puzzleID, req.CardIDs)
	if err != nil {
		// ErrSessionComplete: session already terminal; subsequent calls rejected.
		// ErrDuplicateCards: user input error — duplicate IDs in one guess.
		switch err {
		case services.ErrSessionComplete:
			c.JSON(http.StatusConflict, gin.H{"error": "this puzzle session is already complete"})
		case services.ErrPuzzleNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "puzzle not found"})
		case services.ErrDuplicateCards:
			c.JSON(http.StatusBadRequest, gin.H{"error": "duplicate card ids in guess"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not process guess"})
		}
		return
	}
	c.JSON(http.StatusOK, result)
}

// GET /api/games/confluence/:id/session  (auth required)
func (h *ConfluenceHandler) GetSession(c *gin.Context) {
	userID, _ := authContext(c)
	puzzleID, err := parseUint(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid puzzle id"})
		return
	}
	session, err := h.svc.GetSession(userID, puzzleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load session"})
		return
	}
	c.JSON(http.StatusOK, session)
}

// stripTeachings returns a shallow copy with convergence_teaching removed from all groups.
// Teaching is only sent in GuessResult when a purple group is correctly identified.
func stripTeachings(puzzle *models.ConfluencePuzzle) *models.ConfluencePuzzle {
	stripped := *puzzle
	groups := make([]models.ConfluenceGroup, len(puzzle.Groups))
	for i, g := range puzzle.Groups {
		groups[i] = g
		groups[i].ConvergenceTeaching = ""
	}
	stripped.Groups = groups
	return &stripped
}
