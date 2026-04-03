package services

import (
	"github.com/jamesBoder/daily-stoic/internal/repository"
)

type FeatureFlagService struct {
	subscriptionRepo *repository.SubscriptionRepository
}

func NewFeatureFlagService(subscriptionRepo *repository.SubscriptionRepository) *FeatureFlagService {
	return &FeatureFlagService{subscriptionRepo: subscriptionRepo}
}

// CanAccessPremium returns true if the user has a lifetime subscription.
// userID=0 (unauthenticated) always returns false.
func (s *FeatureFlagService) CanAccessPremium(userID uint) bool {
	if userID == 0 {
		return false
	}
	sub, err := s.subscriptionRepo.GetByUserID(userID)
	if err != nil {
		return false
	}
	return sub.Tier == "lifetime"
}

// ShouldShowAds returns true for free users — false for lifetime members.
// userID=0 (guests) see ads.
func (s *FeatureFlagService) ShouldShowAds(userID uint) bool {
	return !s.CanAccessPremium(userID)
}
