//go:build ignore

// Seed script — run manually to populate the database.
// Usage: go run scripts/seed.go
// Requires: backend/.env or environment variables set

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/jamesBoder/daily-stoic/internal/config"
	"github.com/jamesBoder/daily-stoic/internal/database"
	"github.com/jamesBoder/daily-stoic/internal/models"
)

// --- Tradition seed data ---

var traditionSeedData = []models.Tradition{
	{ID: 1, Name: "Stoicism", Slug: "stoicism", Tier: "free", SortOrder: 1},
	{ID: 2, Name: "Hermeticism", Slug: "hermeticism", Tier: "premium", SortOrder: 2},
	{ID: 3, Name: "Neoplatonism", Slug: "neoplatonism", Tier: "premium", SortOrder: 3},
	{ID: 4, Name: "Gnosticism", Slug: "gnosticism", Tier: "premium", SortOrder: 4},
	{ID: 5, Name: "Kabbalah", Slug: "kabbalah", Tier: "premium", SortOrder: 5},
	{ID: 6, Name: "Pythagoreanism", Slug: "pythagoreanism", Tier: "premium", SortOrder: 6},
	{ID: 7, Name: "Pre-Socratic", Slug: "pre-socratic", Tier: "premium", SortOrder: 7},
}

// --- Author seed data ---

var authorSeedData = []models.Author{
	{Slug: "marcus-aurelius", Name: "Marcus Aurelius", Born: "121 AD", Died: "180 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q1427"},
	{Slug: "epictetus", Name: "Epictetus", Born: "50 AD", Died: "135 AD", Nationality: "Greek", TraditionID: 1, WikidataID: "Q37606"},
	{Slug: "seneca", Name: "Seneca", Born: "4 BC", Died: "65 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q2054"},
	{Slug: "zeno-of-citium", Name: "Zeno of Citium", Born: "334 BC", Died: "262 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q38768"},
	{Slug: "chrysippus", Name: "Chrysippus", Born: "279 BC", Died: "206 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q175697"},
	{Slug: "musonius-rufus", Name: "Musonius Rufus", Born: "20 AD", Died: "101 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q316696"},
	{Slug: "cato-the-younger", Name: "Cato the Younger", Born: "95 BC", Died: "46 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q193290"},
	{Slug: "cleanthes", Name: "Cleanthes", Born: "330 BC", Died: "230 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q178359"},
}

// --- Quote JSON structure ---

type quoteJSON struct {
	Text         string  `json:"text"`
	Source       string  `json:"source"`
	AuthorSlug   string  `json:"author_slug"`
	TraditionID  uint    `json:"tradition_id"`
	Themes       string  `json:"themes"`
	Tier         string  `json:"tier"`
	QualityScore float64 `json:"quality_score"`
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// --- Seed traditions ---
	log.Println("Seeding traditions...")
	for _, t := range traditionSeedData {
		result := db.Where(models.Tradition{ID: t.ID}).FirstOrCreate(&t)
		if result.Error != nil {
			log.Printf("  ERROR tradition %s: %v", t.Slug, result.Error)
		} else if result.RowsAffected > 0 {
			log.Printf("  Created tradition: %s", t.Name)
		} else {
			log.Printf("  Skipped (exists): %s", t.Name)
		}
	}

	// --- Seed authors ---
	log.Println("Seeding authors...")
	authorIDBySlug := make(map[string]uint)
	for _, a := range authorSeedData {
		var existing models.Author
		result := db.Where("slug = ?", a.Slug).FirstOrCreate(&existing, a)
		if result.Error != nil {
			log.Printf("  ERROR author %s: %v", a.Slug, result.Error)
			continue
		}
		if result.RowsAffected > 0 {
			log.Printf("  Created author: %s", a.Name)
			authorIDBySlug[a.Slug] = existing.ID
		} else {
			log.Printf("  Skipped (exists): %s", a.Name)
			authorIDBySlug[a.Slug] = existing.ID
		}
	}

	// --- Seed quotes from JSON ---
	quotesPath := "scripts/seed_data/quotes.json"
	if len(os.Args) > 1 {
		quotesPath = os.Args[1]
	}

	data, err := os.ReadFile(quotesPath)
	if err != nil {
		log.Fatalf("Failed to read %s: %v", quotesPath, err)
	}

	var quotes []quoteJSON
	if err := json.Unmarshal(data, &quotes); err != nil {
		log.Fatalf("Failed to parse quotes JSON: %v", err)
	}

	log.Printf("Seeding %d quotes...", len(quotes))
	created, skipped, failed := 0, 0, 0
	for i, q := range quotes {
		authorID, ok := authorIDBySlug[q.AuthorSlug]
		if !ok {
			log.Printf("  [%d] SKIP — unknown author slug: %s", i+1, q.AuthorSlug)
			failed++
			continue
		}

		quote := models.Quote{
			Text:         q.Text,
			Source:       q.Source,
			AuthorID:     authorID,
			TraditionID:  q.TraditionID,
			Themes:       q.Themes,
			Tier:         q.Tier,
			QualityScore: q.QualityScore,
		}

		var existing models.Quote
		result := db.Where("text = ? AND author_id = ?", q.Text, authorID).First(&existing)
		if result.Error == nil {
			skipped++
			continue
		}

		if err := db.Create(&quote).Error; err != nil {
			log.Printf("  [%d] ERROR: %v", i+1, err)
			failed++
		} else {
			created++
		}
	}

	fmt.Printf("\nDone. Created: %d | Skipped (exists): %d | Failed: %d\n", created, skipped, failed)
}
