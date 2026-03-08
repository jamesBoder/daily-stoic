package services

import (
    "time"
    
    "github.com/jamesBoder/daily-stoic/internal/models"
    "github.com/jamesBoder/daily-stoic/internal/repository"
)

type HistoryService struct {
    historyRepo repository.HistoryRepository
}

func NewHistoryService(historyRepo repository.HistoryRepository) *HistoryService {
    return &HistoryService{
        historyRepo: historyRepo,
    }
}

// GetUserHistory retrieves all history for a user
func (s *HistoryService) GetUserHistory(userID uint) ([]models.History, error) {
    return s.historyRepo.GetByUserID(userID)
}

// GetUserHistoryPaginated retrieves history with pagination
func (s *HistoryService) GetUserHistoryPaginated(userID uint, page, pageSize int) ([]models.History, int64, error) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }
    
    offset := (page - 1) * pageSize
    return s.historyRepo.GetByUserIDPaginated(userID, pageSize, offset)
}

// AddToHistory records a quote view (updates timestamp only if viewed on a different day)
func (s *HistoryService) AddToHistory(userID, quoteID uint) error {
    existingHistory, err := s.historyRepo.FindByUserAndQuote(userID, quoteID)

    if err == nil && existingHistory != nil {
        now := time.Now()
        if existingHistory.ViewedAt.Format("2006-01-02") != now.Format("2006-01-02") {
            return s.historyRepo.UpdateViewedAt(existingHistory.ID, now)
        }
        return nil
    }

    history := &models.History{
        UserID:   userID,
        QuoteID:  quoteID,
        ViewedAt: time.Now(),
    }
    return s.historyRepo.Create(history)
}

// ClearHistory removes all history for a user
func (s *HistoryService) ClearHistory(userID uint) error {
    return s.historyRepo.DeleteByUserID(userID)
}

// ClearOldHistory removes history older than specified days
func (s *HistoryService) ClearOldHistory(userID uint, days int) error {
    cutoffDate := time.Now().AddDate(0, 0, -days)
    return s.historyRepo.DeleteOlderThan(userID, cutoffDate)
}