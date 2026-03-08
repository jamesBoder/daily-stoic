package services

import (
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
)

type StreakService struct {
	streakRepo  *repository.StreakRepository
	historyRepo repository.HistoryRepository
}

func NewStreakService(streakRepo *repository.StreakRepository, historyRepo repository.HistoryRepository) *StreakService {
	return &StreakService{
		streakRepo:  streakRepo,
		historyRepo: historyRepo,
	}
}

// RecordDailyRead is called when an authenticated user views the daily quote.
// Idempotent — calling it multiple times on the same day has no additional effect.
// Returns the updated streak and any newly awarded badge slugs.
func (s *StreakService) RecordDailyRead(userID uint) (*models.UserStreak, []string, error) {
	today := time.Now().UTC().Format("2006-01-02")
	yesterday := time.Now().UTC().AddDate(0, 0, -1).Format("2006-01-02")

	streak, err := s.streakRepo.GetByUserID(userID)
	if err != nil {
		// No streak record yet — initialize
		streak = &models.UserStreak{UserID: userID}
	}

	// Already recorded today — no-op
	if streak.LastReadDate != nil && *streak.LastReadDate == today {
		return streak, nil, nil
	}

	// Calculate new streak value
	if streak.LastReadDate != nil && *streak.LastReadDate == yesterday {
		streak.CurrentStreak++
	} else {
		streak.CurrentStreak = 1 // Broken or first day
	}

	if streak.CurrentStreak > streak.LongestStreak {
		streak.LongestStreak = streak.CurrentStreak
	}

	streak.TotalPoints += s.pointsForStreak(streak.CurrentStreak)
	streak.LastReadDate = &today

	if err := s.streakRepo.Upsert(streak); err != nil {
		return nil, nil, err
	}

	newBadges := s.checkAchievements(userID, streak)
	return streak, newBadges, nil
}

// GetStreak returns the streak record for a user. Returns a zero-state struct if none exists yet.
func (s *StreakService) GetStreak(userID uint) (*models.UserStreak, error) {
	streak, err := s.streakRepo.GetByUserID(userID)
	if err != nil {
		return &models.UserStreak{UserID: userID}, nil
	}
	return streak, nil
}

func (s *StreakService) pointsForStreak(currentStreak int) int {
	switch {
	case currentStreak >= 365:
		return 60
	case currentStreak >= 100:
		return 40
	case currentStreak >= 30:
		return 25
	case currentStreak >= 7:
		return 15
	default:
		return 10
	}
}

func (s *StreakService) checkAchievements(userID uint, streak *models.UserStreak) []string {
	milestones := map[int]string{
		1:   "first-step",
		7:   "the-stoic-week",
		30:  "the-inner-citadel",
		100: "one-hundred-suns",
		365: "the-philosophers-year",
	}
	var awarded []string
	if badge, ok := milestones[streak.CurrentStreak]; ok {
		if err := s.streakRepo.AwardAchievement(userID, badge); err == nil {
			awarded = append(awarded, badge)
		}
	}
	return awarded
}
