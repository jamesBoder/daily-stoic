package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type AuthorRepository struct {
	db *gorm.DB
}

func NewAuthorRepository(db *gorm.DB) *AuthorRepository {
	return &AuthorRepository{db: db}
}

func (r *AuthorRepository) GetAll() ([]models.Author, error) {
	var authors []models.Author
	err := r.db.Find(&authors).Error
	return authors, err
}

func (r *AuthorRepository) GetByID(id uint) (*models.Author, error) {
	var author models.Author
	err := r.db.First(&author, id).Error
	if err != nil {
		return nil, err
	}
	return &author, nil
}

func (r *AuthorRepository) GetBySlug(slug string) (*models.Author, error) {
	var author models.Author
	err := r.db.Where("slug = ?", slug).First(&author).Error
	if err != nil {
		return nil, err
	}
	return &author, nil
}

func (r *AuthorRepository) GetByTradition(traditionID uint) ([]models.Author, error) {
	var authors []models.Author
	err := r.db.Where("tradition_id = ?", traditionID).Find(&authors).Error
	return authors, err
}

// GetBySlugWithQuotes returns an author and all their quotes (with tradition preloaded).
func (r *AuthorRepository) GetBySlugWithQuotes(slug string) (*models.Author, error) {
	var author models.Author
	err := r.db.Where("slug = ?", slug).First(&author).Error
	if err != nil {
		return nil, err
	}
	var quotes []models.Quote
	err = r.db.Where("author_id = ?", author.ID).
		Preload("Tradition").
		Order("quality_score DESC").
		Find(&quotes).Error
	if err != nil {
		return nil, err
	}
	author.Quotes = quotes
	return &author, nil
}
