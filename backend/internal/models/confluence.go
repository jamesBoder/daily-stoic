package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// WisdomConcept is a reusable philosophical concept card.
// Shared across games — Confluence, The Duel, etc. all produce these.
type WisdomConcept struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"type:varchar(120);not null;uniqueIndex" json:"name"`
	ShortPhrase     string    `gorm:"type:varchar(200);not null" json:"short_phrase"`
	TraditionID     uint      `gorm:"not null" json:"tradition_id"`
	Tradition       Tradition `gorm:"foreignKey:TraditionID" json:"tradition,omitempty"`
	IllustrationURL string    `gorm:"type:text" json:"illustration_url,omitempty"`
	QuoteID         *uint     `json:"quote_id,omitempty"`
	Quote           *Quote    `gorm:"foreignKey:QuoteID" json:"quote,omitempty"`
	RarityTier      string    `gorm:"type:varchar(20);not null;default:'common'" json:"rarity_tier"`
	// Codex fields — the card's back-side teaching
	CodexInTradition string `gorm:"type:text" json:"codex_in_tradition,omitempty"`
	CodexEchoes      string `gorm:"type:text" json:"codex_echoes,omitempty"`
	CodexQuestion    string `gorm:"type:text" json:"codex_question,omitempty"`
	CodexPractice    string `gorm:"type:text" json:"codex_practice,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type ConfluencePuzzle struct {
	ID            uint             `gorm:"primaryKey" json:"id"`
	Date          time.Time        `gorm:"type:date;not null;uniqueIndex" json:"date"`
	Title         string           `gorm:"type:varchar(120);not null" json:"title"`
	Archetype     string           `gorm:"type:varchar(30);not null;default:'convergence'" json:"archetype"`
	IsMajorArcana bool             `gorm:"not null;default:false" json:"is_major_arcana"`
	MajorArcanaID *int             `json:"major_arcana_id,omitempty"`
	Groups        []ConfluenceGroup `gorm:"foreignKey:PuzzleID" json:"groups,omitempty"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
}

type ConfluenceGroup struct {
	ID                  uint             `gorm:"primaryKey" json:"id"`
	PuzzleID            uint             `gorm:"not null;index" json:"puzzle_id"`
	Tier                string           `gorm:"type:varchar(10);not null" json:"tier"` // yellow|green|blue|purple
	Label               string           `gorm:"type:varchar(120);not null" json:"label"`
	ConvergenceTeaching string           `gorm:"type:text" json:"convergence_teaching,omitempty"`
	DisplayOrder        int              `gorm:"not null;default:0" json:"display_order"`
	Cards               []ConfluenceCard `gorm:"foreignKey:GroupID" json:"cards,omitempty"`
}

type ConfluenceCard struct {
	ID           uint          `gorm:"primaryKey" json:"id"`
	GroupID      uint          `gorm:"not null;index" json:"group_id"`
	ConceptID    uint          `gorm:"not null" json:"concept_id"`
	Concept      WisdomConcept `gorm:"foreignKey:ConceptID" json:"concept,omitempty"`
	DisplayOrder int           `gorm:"not null;default:0" json:"display_order"`
}

// ConfluenceGameSession tracks a user's play of a specific puzzle.
type ConfluenceGameSession struct {
	ID           uint             `gorm:"primaryKey" json:"id"`
	UserID       uint             `gorm:"not null;index" json:"user_id"`
	PuzzleID     uint             `gorm:"not null;index" json:"puzzle_id"`
	Puzzle       ConfluencePuzzle `gorm:"foreignKey:PuzzleID" json:"puzzle,omitempty"`
	Status       string           `gorm:"type:varchar(20);not null;default:'in_progress'" json:"status"` // in_progress|complete|failed
	AttemptsUsed int              `gorm:"not null;default:0" json:"attempts_used"`
	Attempts     GuessLog         `gorm:"type:jsonb" json:"attempts"`
	GroupsFound  UintSlice        `gorm:"type:jsonb" json:"groups_found"` // group IDs found
	PurpleFirstTry bool           `gorm:"not null;default:false" json:"purple_first_try"`
	NoMistakes   bool             `gorm:"not null;default:false" json:"no_mistakes"`
	CompletedAt  *time.Time       `json:"completed_at,omitempty"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	DeletedAt    gorm.DeletedAt   `gorm:"index" json:"-"`
}

// GuessLog stores the sequence of guess attempts as JSONB.
type GuessAttempt struct {
	CardIDs []uint `json:"card_ids"`
	Correct bool   `json:"correct"`
	Tier    string `json:"tier,omitempty"`    // set only when correct
	OneAway bool   `json:"one_away,omitempty"`
}

type GuessLog []GuessAttempt

func (g GuessLog) Value() (driver.Value, error) {
	b, err := json.Marshal(g)
	return string(b), err
}

func (g *GuessLog) Scan(value interface{}) error {
	var b []byte
	switch v := value.(type) {
	case nil:
		*g = GuessLog{}
		return nil
	case []byte:
		b = v
	case string:
		b = []byte(v)
	default:
		return fmt.Errorf("GuessLog: unsupported type %T", value)
	}
	return json.Unmarshal(b, g)
}

type UintSlice []uint

func (u UintSlice) Value() (driver.Value, error) {
	b, err := json.Marshal(u)
	return string(b), err
}

func (u *UintSlice) Scan(value interface{}) error {
	var b []byte
	switch v := value.(type) {
	case nil:
		*u = UintSlice{}
		return nil
	case []byte:
		b = v
	case string:
		b = []byte(v)
	default:
		return fmt.Errorf("UintSlice: unsupported type %T", value)
	}
	return json.Unmarshal(b, u)
}
