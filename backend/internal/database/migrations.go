package database

import (
	"log"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

// RunMigrations runs GORM AutoMigrate for all models then applies raw SQL for pgvector.
// Safe to run on every startup — AutoMigrate never drops columns, raw additions use IF NOT EXISTS.
func RunMigrations(db *gorm.DB) error {
	// Migrate in dependency order: Tradition and Author first (Quote FKs depend on them)
	if err := db.AutoMigrate(
		&models.User{},
		&models.UserSettings{},
		&models.Tradition{},
		&models.Author{},
		&models.Quote{},
		&models.Favorite{},
		&models.History{},
		&models.Comment{},
		&models.UserStreak{},
		&models.Achievement{},
		&models.Subscription{},
		&models.ReadingPlan{},
		&models.ReadingPlanEntry{},
		&models.UserReadingPlanProgress{},
		&models.Week{},
		&models.AIUsage{},
		&models.WisdomConcept{},
		&models.ConfluencePuzzle{},
		&models.ConfluenceGroup{},
		&models.ConfluenceCard{},
		&models.ConfluenceGameSession{},
		&models.UserLibraryCard{},
		&models.PushSubscription{},
	); err != nil {
		return err
	}

	// Unique indexes for Confluence — one session per user per puzzle, one library entry per user per concept.
	db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_confluence_session_user_puzzle
	         ON confluence_game_sessions(user_id, puzzle_id)
	         WHERE deleted_at IS NULL`)
	db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_library_card
	         ON user_library_cards(user_id, concept_id)
	         WHERE deleted_at IS NULL`)

	// pgvector extension + embedding column — Phase 4+ only, not available on all Postgres hosts.
	// Log and skip if unavailable rather than crashing.
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS vector`).Error; err != nil {
		log.Printf("pgvector extension not available, skipping embedding column: %v", err)
		return nil
	}

	if err := db.Exec(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS embedding vector(1536)`).Error; err != nil {
		log.Printf("Failed to add embedding column: %v", err)
	}

	return nil
}
