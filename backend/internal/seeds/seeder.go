package seeds

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

//go:embed data
var seedFS embed.FS

var traditionSeedData = []models.Tradition{
	{ID: 1, Name: "Stoicism", Slug: "stoicism", Tier: "free", SortOrder: 1},
	{ID: 2, Name: "Hermeticism", Slug: "hermeticism", Tier: "premium", SortOrder: 2},
	{ID: 3, Name: "Neoplatonism", Slug: "neoplatonism", Tier: "premium", SortOrder: 3},
	{ID: 4, Name: "Gnosticism", Slug: "gnosticism", Tier: "premium", SortOrder: 4},
	{ID: 5, Name: "Kabbalah", Slug: "kabbalah", Tier: "premium", SortOrder: 5},
	{ID: 6, Name: "Pythagoreanism", Slug: "pythagoreanism", Tier: "premium", SortOrder: 6},
	{ID: 7, Name: "Pre-Socratic", Slug: "pre-socratic", Tier: "premium", SortOrder: 7},
	{ID: 8, Name: "African Philosophy", Slug: "african-philosophy", Tier: "free", SortOrder: 8},
	{ID: 9, Name: "Renaissance Philosophy", Slug: "renaissance-philosophy", Tier: "free", SortOrder: 9},
	{ID: 10, Name: "Transcendentalism", Slug: "transcendentalism", Tier: "free", SortOrder: 10},
}

var authorSeedData = []models.Author{
	// Stoicism (tradition 1)
	{Slug: "marcus-aurelius", Name: "Marcus Aurelius", Born: "121 AD", Died: "180 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q1427"},
	{Slug: "epictetus", Name: "Epictetus", Born: "50 AD", Died: "135 AD", Nationality: "Greek", TraditionID: 1, WikidataID: "Q37606"},
	{Slug: "seneca", Name: "Seneca", Born: "4 BC", Died: "65 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q2054"},
	{Slug: "zeno-of-citium", Name: "Zeno of Citium", Born: "334 BC", Died: "262 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q38768"},
	{Slug: "chrysippus", Name: "Chrysippus", Born: "279 BC", Died: "206 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q175697"},
	{Slug: "musonius-rufus", Name: "Musonius Rufus", Born: "20 AD", Died: "101 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q316696"},
	{Slug: "cato-the-younger", Name: "Cato the Younger", Born: "95 BC", Died: "46 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q193290"},
	{Slug: "cleanthes", Name: "Cleanthes", Born: "330 BC", Died: "230 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q178359"},
	{Slug: "hierocles", Name: "Hierocles", Born: "100 AD", Died: "150 AD", Nationality: "Greek", TraditionID: 1, WikidataID: "Q314261"},
	{Slug: "cicero", Name: "Cicero", Born: "106 BC", Died: "43 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q1541"},
	{Slug: "publius-syrus", Name: "Publius Syrus", Born: "85 BC", Died: "43 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q216895"},
	// African Philosophy (tradition 8)
	{Slug: "kocc-barma-fall", Name: "Kocc Barma Fall", Born: "1586", Died: "1655", Nationality: "Senegalese", TraditionID: 8, WikidataID: "Q3197285"},
	// Renaissance Philosophy (tradition 9)
	{Slug: "montaigne", Name: "Michel de Montaigne", Born: "1533", Died: "1592", Nationality: "French", TraditionID: 9, WikidataID: "Q44267"},
	{Slug: "francis-bacon", Name: "Francis Bacon", Born: "1561", Died: "1626", Nationality: "English", TraditionID: 9, WikidataID: "Q37388"},
	{Slug: "spinoza", Name: "Baruch Spinoza", Born: "1632", Died: "1677", Nationality: "Dutch", TraditionID: 9, WikidataID: "Q35802"},
	// Transcendentalism (tradition 10)
	{Slug: "emerson", Name: "Ralph Waldo Emerson", Born: "1803", Died: "1882", Nationality: "American", TraditionID: 10, WikidataID: "Q35185"},
	// Hermeticism (tradition 2) — premium
	{Slug: "hermes-trismegistus", Name: "Hermes Trismegistus", Born: "Unknown", Died: "Unknown", Nationality: "Egyptian/Greek", TraditionID: 2, WikidataID: "Q193514"},
	{Slug: "three-initiates", Name: "Three Initiates", Born: "Unknown", Died: "Unknown", Nationality: "American", TraditionID: 2, WikidataID: ""},
	// Neoplatonism (tradition 3) — premium
	{Slug: "plotinus", Name: "Plotinus", Born: "204 AD", Died: "270 AD", Nationality: "Roman/Egyptian", TraditionID: 3, WikidataID: "Q47154"},
	{Slug: "porphyry", Name: "Porphyry", Born: "234 AD", Died: "305 AD", Nationality: "Phoenician", TraditionID: 3, WikidataID: "Q153613"},
	{Slug: "proclus", Name: "Proclus", Born: "412 AD", Died: "485 AD", Nationality: "Greek", TraditionID: 3, WikidataID: "Q131601"},
}

type quoteJSON struct {
	Text         string  `json:"text"`
	Source       string  `json:"source"`
	AuthorSlug   string  `json:"author_slug"`
	TraditionID  uint    `json:"tradition_id"`
	Themes       string  `json:"themes"`
	Tier         string  `json:"tier"`
	QualityScore float64 `json:"quality_score"`
}

// SeedDevUser upserts a local dev account with lifetime access.
// Safe to call on every startup — idempotent.
// Credentials: dev@dailystoic.local / DevStoic1!
func SeedDevUser(db *gorm.DB) error {
	devUser := models.User{
		Email:         "dev@dailystoic.local",
		Username:      "dev",
		Password:      "DevStoic1!",
		EmailVerified: true,
	}
	var user models.User
	if err := db.Where("email = ?", devUser.Email).FirstOrCreate(&user, devUser).Error; err != nil {
		return fmt.Errorf("seed: dev user: %w", err)
	}

	var sub models.Subscription
	if err := db.Where(models.Subscription{UserID: user.ID}).
		Assign(models.Subscription{Tier: "lifetime", Status: "active"}).
		FirstOrCreate(&sub).Error; err != nil {
		return fmt.Errorf("seed: dev subscription: %w", err)
	}

	log.Printf("Dev user ready — email: %s  tier: %s", user.Email, sub.Tier)
	return nil
}

// SeedPremiumContent seeds Hermetic and Neoplatonic quotes from data/premium/.
// Runs on every startup but is a no-op once any tradition-2 or tradition-3 quotes exist.
func SeedPremiumContent(db *gorm.DB) error {
	// Ensure premium authors exist (idempotent — FirstOrCreate)
	authorIDBySlug := make(map[string]uint)
	for _, a := range authorSeedData {
		if a.TraditionID != 2 && a.TraditionID != 3 {
			continue
		}
		var existing models.Author
		if err := db.Where("slug = ?", a.Slug).FirstOrCreate(&existing, a).Error; err != nil {
			log.Printf("seed premium: author %s: %v", a.Slug, err)
			continue
		}
		authorIDBySlug[a.Slug] = existing.ID
	}

	var count int64
	db.Model(&models.Quote{}).Where("tradition_id IN (2,3)").Count(&count)
	if count > 0 {
		log.Printf("Premium content already seeded (%d quotes) — skipping", count)
		return nil
	}

	entries, err := fs.ReadDir(seedFS, "data/premium")
	if err != nil {
		return fmt.Errorf("seed premium: read dir: %w", err)
	}

	created, skipped, failed := 0, 0, 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		raw, err := seedFS.ReadFile("data/premium/" + entry.Name())
		if err != nil {
			log.Printf("seed premium: read %s: %v", entry.Name(), err)
			continue
		}
		var quotes []quoteJSON
		if err := json.Unmarshal(raw, &quotes); err != nil {
			log.Printf("seed premium: parse %s: %v", entry.Name(), err)
			continue
		}
		for _, q := range quotes {
			authorID, ok := authorIDBySlug[q.AuthorSlug]
			if !ok {
				log.Printf("seed premium: unknown author slug %q in %s", q.AuthorSlug, entry.Name())
				failed++
				continue
			}
			var themes models.StringSlice
			if q.Themes != "" {
				_ = json.Unmarshal([]byte(q.Themes), &themes)
			}
			quote := models.Quote{
				Text:         q.Text,
				Source:       q.Source,
				AuthorID:     authorID,
				TraditionID:  q.TraditionID,
				Themes:       themes,
				Tier:         q.Tier,
				QualityScore: q.QualityScore,
			}
			var existing models.Quote
			if db.Where("text = ? AND author_id = ?", q.Text, authorID).First(&existing).Error == nil {
				skipped++
				continue
			}
			if err := db.Create(&quote).Error; err != nil {
				failed++
			} else {
				created++
			}
		}
	}

	log.Printf("Premium seed complete — created: %d | skipped: %d | failed: %d", created, skipped, failed)
	return nil
}

// SeedIfEmpty seeds traditions, authors, and quotes only when the quotes table
// is empty. Safe to call on every startup — it's a no-op after the first run.
func SeedIfEmpty(db *gorm.DB) error {
	var count int64
	db.Model(&models.Quote{}).Count(&count)
	if count > 0 {
		return nil
	}

	log.Println("Quotes table is empty — seeding database...")
	return seed(db)
}

func seed(db *gorm.DB) error {
	// Traditions
	for _, t := range traditionSeedData {
		if err := db.Where(models.Tradition{ID: t.ID}).FirstOrCreate(&t).Error; err != nil {
			log.Printf("seed: tradition %s: %v", t.Slug, err)
		}
	}

	// Authors — build slug→ID map for quote insertion
	authorIDBySlug := make(map[string]uint, len(authorSeedData))
	for _, a := range authorSeedData {
		var existing models.Author
		if err := db.Where("slug = ?", a.Slug).FirstOrCreate(&existing, a).Error; err != nil {
			log.Printf("seed: author %s: %v", a.Slug, err)
			continue
		}
		authorIDBySlug[a.Slug] = existing.ID
	}

	// Quotes — load every JSON file from the embedded data directory
	entries, err := fs.ReadDir(seedFS, "data")
	if err != nil {
		return err
	}

	created, skipped, failed := 0, 0, 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		raw, err := seedFS.ReadFile("data/" + entry.Name())
		if err != nil {
			log.Printf("seed: read %s: %v", entry.Name(), err)
			continue
		}
		var quotes []quoteJSON
		if err := json.Unmarshal(raw, &quotes); err != nil {
			log.Printf("seed: parse %s: %v", entry.Name(), err)
			continue
		}
		for _, q := range quotes {
			authorID, ok := authorIDBySlug[q.AuthorSlug]
			if !ok {
				failed++
				continue
			}
			var themes models.StringSlice
			if q.Themes != "" {
				_ = json.Unmarshal([]byte(q.Themes), &themes)
			}
			quote := models.Quote{
				Text:         q.Text,
				Source:       q.Source,
				AuthorID:     authorID,
				TraditionID:  q.TraditionID,
				Themes:       themes,
				Tier:         q.Tier,
				QualityScore: q.QualityScore,
			}
			var existing models.Quote
			if db.Where("text = ? AND author_id = ?", q.Text, authorID).First(&existing).Error == nil {
				skipped++
				continue
			}
			if err := db.Create(&quote).Error; err != nil {
				failed++
			} else {
				created++
			}
		}
	}

	log.Printf("Seed complete — created: %d | skipped: %d | failed: %d", created, skipped, failed)
	return nil
}
