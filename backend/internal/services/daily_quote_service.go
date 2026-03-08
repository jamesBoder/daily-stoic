package services

import (
	"crypto/md5"
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
// Selection algorithm: MD5 hash of today's date → deterministic index into available quotes.
// Excludes quotes used in the last 90 days.
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

	// Get all free quotes without a daily_date assigned
	available, err := s.quoteRepo.GetFreeQuotesWithoutDate()
	if err != nil {
		return nil, err
	}

	// Filter out recently used
	filtered := make([]models.Quote, 0, len(available))
	for _, q := range available {
		if q.DailyDate == nil || !excludeSet[*q.DailyDate] {
			filtered = append(filtered, q)
		}
	}

	// Fallback: reuse all free quotes if pool is exhausted
	if len(filtered) == 0 {
		filtered, err = s.quoteRepo.GetAllFreeQuotes()
		if err != nil || len(filtered) == 0 {
			return nil, fmt.Errorf("no available quotes for today")
		}
	}

	// MD5-based deterministic index — same date always picks same quote
	hash := md5.Sum([]byte(today))
	index := (int(hash[0])<<8 | int(hash[1])) % len(filtered)
	selected := filtered[index]

	// Assign today's date to the selected quote
	if err := s.quoteRepo.AssignDate(selected.ID, today); err != nil {
		return nil, err
	}

	return s.quoteRepo.GetByDate(today)
}
