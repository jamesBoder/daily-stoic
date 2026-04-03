package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

// FavoriteRepository defines the interface for favorite-related database operations.
type FavoriteRepository interface {
	Create(favorite *models.Favorite) error
	GetByID(id uint) (*models.Favorite, error)
	GetByUserID(userID uint) ([]models.Favorite, error)
	GetByUserIDPaginated(userID uint, limit int, offset int) ([]models.Favorite, int64, error)
	Delete(id uint) error
	DeleteByUserAndQuote(userID uint, quoteID uint) error
	Exists(userID uint, quoteID uint) (bool, error)
	SearchFavorites(userID uint, query string, limit, offset int) ([]models.Favorite, int64, error)
	CountByUserID(userID uint) (int64, error)
}

type favoriteRepository struct {
	db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) FavoriteRepository {
	return &favoriteRepository{db: db}
}

func (r *favoriteRepository) Create(favorite *models.Favorite) error {
	return r.db.Create(favorite).Error
}

func (r *favoriteRepository) GetByID(id uint) (*models.Favorite, error) {
	var favorite models.Favorite
	if err := r.db.First(&favorite, id).Error; err != nil {
		return nil, err
	}
	return &favorite, nil
}

func (r *favoriteRepository) GetByUserID(userID uint) ([]models.Favorite, error) {
	var favorites []models.Favorite
	if err := r.db.Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		return nil, err
	}
	return favorites, nil
}

func (r *favoriteRepository) GetByUserIDPaginated(userID uint, limit int, offset int) ([]models.Favorite, int64, error) {
	var favorites []models.Favorite
	var total int64

	if err := r.db.Model(&models.Favorite{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.Preload("Quote").Preload("Quote.Author").Preload("Quote.Tradition").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&favorites).Error; err != nil {
		return nil, 0, err
	}

	return favorites, total, nil
}

func (r *favoriteRepository) Delete(id uint) error {
	return r.db.Delete(&models.Favorite{}, id).Error
}

func (r *favoriteRepository) DeleteByUserAndQuote(userID uint, quoteID uint) error {
	return r.db.Where("user_id = ? AND quote_id = ?", userID, quoteID).Delete(&models.Favorite{}).Error
}

func (r *favoriteRepository) Exists(userID uint, quoteID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Favorite{}).Where("user_id = ? AND quote_id = ?", userID, quoteID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *favoriteRepository) SearchFavorites(userID uint, query string, limit, offset int) ([]models.Favorite, int64, error) {
	var favorites []models.Favorite
	var total int64

	db := r.db.Joins("JOIN quotes ON favorites.quote_id = quotes.id").
		Where("favorites.user_id = ?", userID)

	if query != "" {
		searchPattern := "%" + query + "%"
		db = db.Where("quotes.text ILIKE ? OR quotes.source ILIKE ?", searchPattern, searchPattern)
	}

	db.Model(&models.Favorite{}).Count(&total)

	err := db.Preload("Quote").Preload("Quote.Author").Preload("Quote.Tradition").
		Order("favorites.created_at DESC").
		Limit(limit).Offset(offset).
		Find(&favorites).Error

	return favorites, total, err
}

func (r *favoriteRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Favorite{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
