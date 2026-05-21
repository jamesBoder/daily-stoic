package seeds

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type readingPlanJSON struct {
	Slug          string          `json:"slug"`
	Title         string          `json:"title"`
	Description   string          `json:"description"`
	Tier          string          `json:"tier"`
	TraditionSlug string          `json:"tradition_slug"`
	Entries       []planEntryJSON `json:"entries"`
}

type planEntryJSON struct {
	Day        int    `json:"day"`
	Title      string `json:"title"`
	Intro      string `json:"intro"`
	AuthorSlug string `json:"author_slug"`
}

// SeedReadingPlans seeds the two curated reading plans. Idempotent — skips plans that already exist.
func SeedReadingPlans(db *gorm.DB) error {
	files := []string{
		"data/reading_plan_stoic_virtues.json",
		"data/reading_plan_hermetic_principles.json",
	}
	for _, f := range files {
		if err := seedReadingPlanFromFile(db, f); err != nil {
			return fmt.Errorf("seed %s: %w", f, err)
		}
	}
	return nil
}

func seedReadingPlanFromFile(db *gorm.DB, path string) error {
	raw, err := seedFS.ReadFile(path)
	if err != nil {
		return err
	}

	var data readingPlanJSON
	if err := json.Unmarshal(raw, &data); err != nil {
		return err
	}

	// Skip if plan already exists
	var count int64
	db.Model(&models.ReadingPlan{}).Where("slug = ?", data.Slug).Count(&count)
	if count > 0 {
		log.Printf("Reading plan '%s' already exists — skipping", data.Slug)
		return nil
	}

	// Look up tradition
	var tradition models.Tradition
	if err := db.Where("slug = ?", data.TraditionSlug).First(&tradition).Error; err != nil {
		return fmt.Errorf("tradition '%s' not found: %w", data.TraditionSlug, err)
	}

	plan := models.ReadingPlan{
		Slug:         data.Slug,
		Title:        data.Title,
		Description:  data.Description,
		Tier:         data.Tier,
		DurationDays: len(data.Entries),
		TraditionID:  &tradition.ID,
	}
	if err := db.Create(&plan).Error; err != nil {
		return fmt.Errorf("create plan: %w", err)
	}

	// Track used quote IDs per author so we don't reuse the same quote
	usedQuoteIDs := map[string][]uint{}

	for _, e := range data.Entries {
		entry := models.ReadingPlanEntry{
			ReadingPlanID: plan.ID,
			DayNumber:     e.Day,
			Title:         e.Title,
			IntroText:     e.Intro,
		}

		// Try to link the best available quote for this author
		if e.AuthorSlug != "" {
			quoteID := pickQuoteForPlanEntry(db, e.AuthorSlug, usedQuoteIDs[e.AuthorSlug])
			if quoteID != 0 {
				entry.QuoteID = &quoteID
				usedQuoteIDs[e.AuthorSlug] = append(usedQuoteIDs[e.AuthorSlug], quoteID)
			}
		}

		if err := db.Create(&entry).Error; err != nil {
			return fmt.Errorf("create entry day %d: %w", e.Day, err)
		}
	}

	log.Printf("Seeded reading plan '%s' with %d entries", plan.Slug, len(data.Entries))
	return nil
}

// pickQuoteForPlanEntry returns the highest-quality-score quote by the given author
// that is not already in the excluded list. Returns 0 if none found.
func pickQuoteForPlanEntry(db *gorm.DB, authorSlug string, exclude []uint) uint {
	var author models.Author
	if err := db.Where("slug = ?", authorSlug).First(&author).Error; err != nil {
		return 0
	}

	query := db.Model(&models.Quote{}).
		Where("author_id = ?", author.ID).
		Order("quality_score DESC")

	if len(exclude) > 0 {
		query = query.Not("id IN ?", exclude)
	}

	var quote models.Quote
	if err := query.First(&quote).Error; err != nil {
		return 0
	}
	return quote.ID
}
