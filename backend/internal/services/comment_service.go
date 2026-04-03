package services

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
)

type CommentService struct {
	commentRepo *repository.CommentRepository
}

func NewCommentService(commentRepo *repository.CommentRepository) *CommentService {
	return &CommentService{commentRepo: commentRepo}
}

// AddOrUpdateComment creates or updates a comment for a specific quote by the user.
// One comment per user per quote — updates in place if one already exists.
func (s *CommentService) AddOrUpdateComment(userID uint, quoteID uint, commentText string) (*models.Comment, error) {
	existing, err := s.commentRepo.GetByUserAndQuote(userID, quoteID)
	if err == nil && existing != nil {
		existing.CommentText = commentText
		err = s.commentRepo.Update(existing)
		return existing, err
	}

	comment := &models.Comment{
		UserID:      userID,
		QuoteID:     quoteID,
		CommentText: commentText,
	}
	err = s.commentRepo.Create(comment)
	return comment, err
}

func (s *CommentService) GetCommentForQuote(userID uint, quoteID uint) (*models.Comment, error) {
	return s.commentRepo.GetByUserAndQuote(userID, quoteID)
}

func (s *CommentService) DeleteComment(commentID uint, userID uint) error {
	return s.commentRepo.Delete(commentID, userID)
}

func (s *CommentService) GetUserComments(userID uint) ([]models.Comment, error) {
	return s.commentRepo.GetByUser(userID)
}
