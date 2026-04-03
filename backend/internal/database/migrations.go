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
		&models.Tradition{},
		&models.Author{},
		&models.Quote{},
		&models.Favorite{},
		&models.History{},
		&models.Comment{},
		&models.UserStreak{},
		&models.Achievement{},
		&models.Subscription{},
	); err != nil {
		return err
	}

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
