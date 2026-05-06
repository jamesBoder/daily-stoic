package services

import (
	"errors"
	"log"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"gorm.io/gorm"
)

const maxAttempts = 4

type ConfluenceService struct {
	repo    *repository.ConfluenceRepository
	library LibraryUnlocker
}

// LibraryUnlocker is the interface ConfluenceService needs from LibraryService.
type LibraryUnlocker interface {
	UnlockConfluenceCards(userID uint, session *models.ConfluenceGameSession, puzzle *models.ConfluencePuzzle)
}

func NewConfluenceService(repo *repository.ConfluenceRepository, library LibraryUnlocker) *ConfluenceService {
	return &ConfluenceService{repo: repo, library: library}
}

var ErrPuzzleNotFound   = errors.New("no puzzle for this date")
var ErrSessionComplete  = errors.New("session already complete")
var ErrDuplicateCards   = errors.New("duplicate card ids in guess")
var ErrSessionNotFound  = errors.New("no session for this puzzle")

// Note: no ErrAttemptsExhausted — the service returns a normal GuessResult on the
// final wrong guess and marks the session "failed". Subsequent calls hit ErrSessionComplete.

type GuessResult struct {
	Correct             bool                     `json:"correct"`
	Tier                string                   `json:"tier,omitempty"`
	Label               string                   `json:"label,omitempty"`
	ConvergenceTeaching string                   `json:"convergence_teaching,omitempty"`
	OneAway             bool                     `json:"one_away,omitempty"`
	AttemptsRemaining   int                      `json:"attempts_remaining"`
	SessionStatus       string                   `json:"session_status"`
	PurpleFirstTry      bool                     `json:"purple_first_try,omitempty"`
	NoMistakes          bool                     `json:"no_mistakes,omitempty"`
	FullReveal          *models.ConfluencePuzzle `json:"full_reveal,omitempty"`
}

func (s *ConfluenceService) GetTodayPuzzle() (*models.ConfluencePuzzle, error) {
	return s.repo.GetPuzzleForDate(time.Now().UTC())
}

func (s *ConfluenceService) GetPuzzleByDate(date time.Time) (*models.ConfluencePuzzle, error) {
	return s.repo.GetPuzzleForDate(date)
}

func (s *ConfluenceService) GetSession(userID, puzzleID uint) (*models.ConfluenceGameSession, error) {
	session, err := s.repo.GetSession(userID, puzzleID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrSessionNotFound
	}
	return session, err
}

// SubmitGuess validates 4 card IDs against the puzzle and updates the session.
func (s *ConfluenceService) SubmitGuess(userID, puzzleID uint, cardIDs []uint) (*GuessResult, error) {
	session, _, err := s.repo.GetOrCreateSession(userID, puzzleID)
	if err != nil {
		return nil, err
	}

	// Reject duplicate card IDs — a guess of [1,1,1,1] would trivially match any group.
	seen := make(map[uint]bool, len(cardIDs))
	for _, id := range cardIDs {
		if seen[id] {
			return nil, ErrDuplicateCards
		}
		seen[id] = true
	}

	if session.Status != "in_progress" {
		return nil, ErrSessionComplete
	}

	puzzle, err := s.repo.GetPuzzleByID(puzzleID)
	if err != nil {
		return nil, ErrPuzzleNotFound
	}

	var matchedGroup *models.ConfluenceGroup
	var oneAway bool

	for i := range puzzle.Groups {
		g := &puzzle.Groups[i]
		if containsUint(session.GroupsFound, g.ID) {
			continue
		}
		matches := countMatches(cardIDs, g.Cards)
		if matches == 4 {
			matchedGroup = g
			break
		}
		if matches == 3 {
			oneAway = true
		}
	}

	attempt := models.GuessAttempt{CardIDs: cardIDs, OneAway: oneAway}
	result := &GuessResult{AttemptsRemaining: maxAttempts - session.AttemptsUsed}

	if matchedGroup != nil {
		attempt.Correct = true
		attempt.Tier = matchedGroup.Tier
		session.GroupsFound = append(session.GroupsFound, matchedGroup.ID)

		result.Correct = true
		result.Tier = matchedGroup.Tier
		result.Label = matchedGroup.Label

		if matchedGroup.Tier == "purple" {
			result.ConvergenceTeaching = matchedGroup.ConvergenceTeaching
			// PurpleFirstTry: purple found first with zero wrong guesses.
			if session.AttemptsUsed == 0 && len(session.GroupsFound) == 1 {
				session.PurpleFirstTry = true
				result.PurpleFirstTry = true
			}
		}
	} else {
		attempt.Correct = false
		session.AttemptsUsed++
		result.OneAway = oneAway
		result.AttemptsRemaining = maxAttempts - session.AttemptsUsed
	}

	session.Attempts = append(session.Attempts, attempt)

	if len(session.GroupsFound) == 4 {
		session.Status = "complete"
		now := time.Now()
		session.CompletedAt = &now
		session.NoMistakes = session.AttemptsUsed == 0
		result.NoMistakes = session.NoMistakes
		result.PurpleFirstTry = session.PurpleFirstTry
		result.FullReveal = puzzle
		if s.library != nil {
			go func() {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("confluence: library unlock panic: %v", r)
					}
				}()
				s.library.UnlockConfluenceCards(userID, session, puzzle)
			}()
		}
	} else if session.AttemptsUsed >= maxAttempts {
		session.Status = "failed"
		result.FullReveal = puzzle
	}

	result.SessionStatus = session.Status
	if err = s.repo.SaveSession(session); err != nil {
		return nil, err
	}
	return result, nil
}

func countMatches(cardIDs []uint, cards []models.ConfluenceCard) int {
	n := 0
	for _, c := range cards {
		for _, id := range cardIDs {
			if c.ID == id {
				n++
			}
		}
	}
	return n
}

func containsUint(slice []uint, v uint) bool {
	for _, x := range slice {
		if x == v {
			return true
		}
	}
	return false
}
