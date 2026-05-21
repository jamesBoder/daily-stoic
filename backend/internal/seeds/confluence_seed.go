package seeds

import (
	_ "embed"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

//go:embed data/confluence_puzzles.json
var confluencePuzzlesJSON []byte

type confluenceCardSeed struct {
	Concept     string `json:"concept"`
	ShortPhrase string `json:"short_phrase"`
	Tradition   string `json:"tradition"`
	RarityTier  string `json:"rarity_tier"`
	QuoteRef    string `json:"quote_ref,omitempty"`
}

type confluenceGroupSeed struct {
	Tier                string               `json:"tier"`
	Label               string               `json:"label"`
	DisplayOrder        int                  `json:"display_order"`
	ConvergenceTeaching string               `json:"convergence_teaching,omitempty"`
	Cards               []confluenceCardSeed `json:"cards"`
}

type confluencePuzzleSeed struct {
	Date          string                `json:"date"`
	Title         string                `json:"title"`
	Archetype     string                `json:"archetype"`
	IsMajorArcana bool                  `json:"is_major_arcana"`
	MajorArcanaID *int                  `json:"major_arcana_id,omitempty"`
	Groups        []confluenceGroupSeed `json:"groups"`
}

type confluenceSeedFile struct {
	Puzzles []confluencePuzzleSeed `json:"puzzles"`
}

func SeedConfluencePuzzles(db *gorm.DB) {
	var file confluenceSeedFile
	if err := json.Unmarshal(confluencePuzzlesJSON, &file); err != nil {
		log.Printf("confluence seed: failed to parse JSON: %v", err)
		return
	}

	// Build tradition slug → ID map
	var traditions []models.Tradition
	db.Find(&traditions)
	tradMap := make(map[string]uint)
	for _, t := range traditions {
		tradMap[strings.ToLower(t.Slug)] = t.ID
	}

	for _, ps := range file.Puzzles {
		date, err := time.Parse("2006-01-02", ps.Date)
		if err != nil {
			log.Printf("confluence seed: bad date %q: %v", ps.Date, err)
			continue
		}

		puzzle := models.ConfluencePuzzle{
			Date:          date,
			Title:         ps.Title,
			Archetype:     ps.Archetype,
			IsMajorArcana: ps.IsMajorArcana,
			MajorArcanaID: ps.MajorArcanaID,
		}
		db.Where(models.ConfluencePuzzle{Date: date}).
			Assign(models.ConfluencePuzzle{Title: ps.Title, Archetype: ps.Archetype, IsMajorArcana: ps.IsMajorArcana, MajorArcanaID: ps.MajorArcanaID}).
			FirstOrCreate(&puzzle)

		for _, gs := range ps.Groups {
			group := models.ConfluenceGroup{
				PuzzleID:            puzzle.ID,
				Tier:                gs.Tier,
				Label:               gs.Label,
				ConvergenceTeaching: gs.ConvergenceTeaching,
				DisplayOrder:        gs.DisplayOrder,
			}
			db.Where(models.ConfluenceGroup{PuzzleID: puzzle.ID, Tier: gs.Tier}).
				Assign(models.ConfluenceGroup{Label: gs.Label, ConvergenceTeaching: gs.ConvergenceTeaching}).
				FirstOrCreate(&group)

			for i, cs := range gs.Cards {
				tradID, ok := tradMap[strings.ToLower(cs.Tradition)]
				if !ok {
					log.Printf("confluence seed: unknown tradition %q for concept %q — skipping", cs.Tradition, cs.Concept)
					continue
				}

				concept := models.WisdomConcept{
					Name:        cs.Concept,
					ShortPhrase: cs.ShortPhrase,
					TraditionID: tradID,
					RarityTier:  cs.RarityTier,
				}
				// rarity_tier intentionally excluded — first-seeded value is canonical;
				// re-seeding must not downgrade a concept that already exists at a higher tier.
				db.Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "name"}},
					DoUpdates: clause.AssignmentColumns([]string{"short_phrase"}),
				}).Create(&concept)

				card := models.ConfluenceCard{
					GroupID:      group.ID,
					ConceptID:    concept.ID,
					DisplayOrder: i,
				}
				db.Where(models.ConfluenceCard{GroupID: group.ID, ConceptID: concept.ID}).
					FirstOrCreate(&card)
			}
		}
	}
	log.Printf("confluence seed: done — %d puzzles processed", len(file.Puzzles))
}
