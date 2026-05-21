package services

import (
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
)

type DailyQuoteService struct {
	quoteRepo *repository.QuoteRepository
}

func NewDailyQuoteService(quoteRepo *repository.QuoteRepository) *DailyQuoteService {
	return &DailyQuoteService{quoteRepo: quoteRepo}
}

// GetDailyQuote returns today's assigned quote, or selects and assigns one if not yet set.
//
// Selection algorithm:
//  1. SHA256 hash of date → pick a free tradition (ensures equal rotation across traditions).
//  2. SHA256 hash of date+"q" → deterministic index into that tradition's available quotes.
//  3. Excludes quotes used in the last 90 days; falls back to full tradition pool if exhausted.
//  4. If a tradition has no quotes at all, falls back to the global free-quote pool.
func (s *DailyQuoteService) GetDailyQuote() (*models.Quote, error) {
	today := time.Now().UTC().Format("2006-01-02")

	// Return today's quote if already assigned
	quote, err := s.quoteRepo.GetByDate(today)
	if err == nil {
		return quote, nil
	}

	// Build exclusion set from the last 90 days
	recentDates, err := s.quoteRepo.GetRecentDates(90)
	if err != nil {
		return nil, err
	}
	excludeSet := make(map[string]bool, len(recentDates))
	for _, d := range recentDates {
		excludeSet[d] = true
	}

	// Pick a tradition for today using a deterministic hash
	traditions, err := s.quoteRepo.GetFreeTraditionSlugs()
	if err != nil || len(traditions) == 0 {
		return nil, fmt.Errorf("no free traditions available")
	}
	hashT := sha256.Sum256([]byte(today + "t"))
	traditionIdx := (int(hashT[0])<<8 | int(hashT[1])) % len(traditions)
	chosenTradition := traditions[traditionIdx]

	// Get available quotes from that tradition
	filtered, err := s.quoteRepo.GetFreeQuotesByTraditionWithoutDate(chosenTradition, excludeSet)
	if err != nil {
		return nil, err
	}

	// Fallback 1: all quotes from that tradition (ignore 90-day window)
	if len(filtered) == 0 {
		filtered, err = s.quoteRepo.GetAllFreeQuotesByTradition(chosenTradition)
		if err != nil {
			return nil, err
		}
	}

	// Fallback 2: tradition has no quotes at all — use the global free pool
	if len(filtered) == 0 {
		filtered, err = s.quoteRepo.GetAllFreeQuotes()
		if err != nil || len(filtered) == 0 {
			return nil, fmt.Errorf("no available quotes for today")
		}
	}

	// Deterministic index — same date always picks the same quote
	hashQ := sha256.Sum256([]byte(today + "q"))
	index := (int(hashQ[0])<<8 | int(hashQ[1])) % len(filtered)
	selected := filtered[index]

	// Assign today's date to the selected quote
	if err := s.quoteRepo.AssignDate(selected.ID, today); err != nil {
		return nil, err
	}

	return s.quoteRepo.GetByDate(today)
}
