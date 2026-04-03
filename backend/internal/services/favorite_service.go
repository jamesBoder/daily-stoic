package services

import (
	"errors"
	"fmt"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
)

type FavoriteService struct {
	favoriteRepo repository.FavoriteRepository
	quoteRepo    *repository.QuoteRepository
}

func NewFavoriteService(
	favoriteRepo repository.FavoriteRepository,
	quoteRepo *repository.QuoteRepository,
) *FavoriteService {
	return &FavoriteService{
		favoriteRepo: favoriteRepo,
		quoteRepo:    quoteRepo,
	}
}

func (s *FavoriteService) GetUserFavorites(userID uint) ([]models.Favorite, error) {
	return s.favoriteRepo.GetByUserID(userID)
}

func (s *FavoriteService) GetUserFavoritesPaginated(userID uint, search string, page, pageSize int) ([]models.Favorite, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	if search != "" {
		return s.favoriteRepo.SearchFavorites(userID, search, pageSize, offset)
	}
	return s.favoriteRepo.GetByUserIDPaginated(userID, pageSize, offset)
}

func (s *FavoriteService) AddFavorite(userID, quoteID uint) error {
	quote, err := s.quoteRepo.GetByID(quoteID)
	if err != nil || quote == nil {
		return fmt.Errorf("quote not found: %w", err)
	}

	exists, err := s.favoriteRepo.Exists(userID, quoteID)
	if err != nil {
		return fmt.Errorf("failed to check favorite: %w", err)
	}
	if exists {
		return errors.New("quote already in favorites")
	}

	return s.favoriteRepo.Create(&models.Favorite{
		UserID:  userID,
		QuoteID: quoteID,
	})
}

func (s *FavoriteService) RemoveFavorite(userID, favoriteID uint) error {
	favorite, err := s.favoriteRepo.GetByID(favoriteID)
	if err != nil {
		return fmt.Errorf("favorite not found: %w", err)
	}
	if favorite.UserID != userID {
		return errors.New("unauthorized: favorite belongs to another user")
	}
	return s.favoriteRepo.Delete(favoriteID)
}

func (s *FavoriteService) IsFavorited(userID, quoteID uint) (bool, error) {
	return s.favoriteRepo.Exists(userID, quoteID)
}
