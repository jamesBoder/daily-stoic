package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(comment *models.Comment) error {
	return r.db.Create(comment).Error
}

func (r *CommentRepository) GetByUserAndQuote(userID uint, quoteID uint) (*models.Comment, error) {
	var comment models.Comment
	err := r.db.Where("user_id = ? AND quote_id = ?", userID, quoteID).First(&comment).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *CommentRepository) Update(comment *models.Comment) error {
	return r.db.Save(comment).Error
}

func (r *CommentRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Comment{}).Error
}

func (r *CommentRepository) GetByUser(userID uint) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Where("user_id = ?", userID).
		Preload("Quote").Preload("Quote.Author").
		Order("created_at DESC").
		Find(&comments).Error
	return comments, err
}

func (r *CommentRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Comment{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
