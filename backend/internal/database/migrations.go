package database

import (
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
	); err != nil {
		return err
	}

	// pgvector extension — required for embedding column (Phase 4+)
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS vector`).Error; err != nil {
		return err
	}

	// embedding column — NOT managed by GORM to avoid type conflicts with pgvector
	if err := db.Exec(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS embedding vector(1536)`).Error; err != nil {
		return err
	}

	return nil
}
