package services

import (
	"errors"
	"log"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var rarityRank = map[string]int{
	"common":       0,
	"uncommon":     1,
	"rare":         2,
	"major_arcana": 3,
}

func maxRarity(a, b string) string {
	if rarityRank[a] >= rarityRank[b] {
		return a
	}
	return b
}

func upgradeRarity(r string) string {
	switch r {
	case "common":
		return "uncommon"
	case "uncommon":
		return "rare"
	case "rare":
		return "major_arcana"
	default:
		return r
	}
}

type LibraryService struct {
	db *gorm.DB
}

func NewLibraryService(db *gorm.DB) *LibraryService {
	return &LibraryService{db: db}
}

// UnlockConfluenceCards upserts UserLibraryCard entries for all 16 cards in a completed puzzle.
// Rarity rules (§16):
//   - Base rarity = concept's seeded rarity_tier
//   - Purple group cards → upgrade to "rare"
//   - purple_first_try → purple group cards → upgrade to "major_arcana"
//   - no_mistakes → upgrade all 16 by one tier
//
// Existing cards are never downgraded — only upgraded.
func (s *LibraryService) UnlockConfluenceCards(userID uint, session *models.ConfluenceGameSession, puzzle *models.ConfluencePuzzle) {
	now := time.Now()

	// Build set of purple-group concept IDs for O(1) lookup
	purpleConceptIDs := make(map[uint]bool)
	for i := range puzzle.Groups {
		if puzzle.Groups[i].Tier == "purple" {
			for _, card := range puzzle.Groups[i].Cards {
				purpleConceptIDs[card.ConceptID] = true
			}
		}
	}

	for i := range puzzle.Groups {
		for _, card := range puzzle.Groups[i].Cards {
			rarity := card.Concept.RarityTier
			if rarity == "" {
				rarity = "common"
			}

			// Purple group → at least rare
			if purpleConceptIDs[card.ConceptID] {
				rarity = maxRarity(rarity, "rare")
			}

			// Purple-first-try → purple group cards earn major_arcana
			if session.PurpleFirstTry && purpleConceptIDs[card.ConceptID] {
				rarity = "major_arcana"
			}

			// No mistakes → upgrade every card one tier (caps at major_arcana)
			if session.NoMistakes {
				rarity = upgradeRarity(rarity)
			}

			if err := s.upsertCard(userID, card.ConceptID, rarity, now); err != nil {
				log.Printf("library: failed to upsert concept_id=%d user=%d: %v", card.ConceptID, userID, err)
			}
		}
	}

	log.Printf("library: unlocked cards for user=%d puzzle=%d (no_mistakes=%v purple_first_try=%v)",
		userID, puzzle.ID, session.NoMistakes, session.PurpleFirstTry)
}

func (s *LibraryService) upsertCard(userID, conceptID uint, rarity string, now time.Time) error {
	var existing models.UserLibraryCard
	err := s.db.Where("user_id = ? AND concept_id = ? AND deleted_at IS NULL", userID, conceptID).
		First(&existing).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserLibraryCard{
			UserID:     userID,
			ConceptID:  conceptID,
			RarityTier: rarity,
			EarnedVia:  "confluence",
			EarnedAt:   now,
		}).Error
	}
	if err != nil {
		return err
	}

	// Only upgrade — never downgrade an existing card.
	if rarityRank[rarity] > rarityRank[existing.RarityTier] {
		return s.db.Model(&existing).Updates(map[string]interface{}{
			"rarity_tier": rarity,
			"updated_at":  now,
		}).Error
	}
	return nil
}
