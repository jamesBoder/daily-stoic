package jobs

import (
	"fmt"
	"log"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"gorm.io/gorm"
)

// weekTheme defines a curated weekly theme.
type weekTheme struct {
	slug        string
	title       string
	description string
	// dbThemeTag is the value to match against the quotes.themes JSON column.
	// Must match one of the theme slugs in the seed data.
	dbThemeTag string
}

// weeklyThemes is a 26-entry rotation. ISO week number mod 26 selects the theme.
// Themes are ordered to give a varied year of practice.
var weeklyThemes = []weekTheme{
	{
		slug: "virtue", title: "Week of Virtue",
		description: "The Stoics held that virtue alone is sufficient for the good life. This week we examine what it means to be genuinely good.",
		dbThemeTag:  "virtue",
	},
	{
		slug: "resilience", title: "Week of Resilience",
		description: "To stand firm in the face of difficulty without complaint or despair — this is the Stoic art of resilience.",
		dbThemeTag:  "resilience",
	},
	{
		slug: "wisdom", title: "Week of Wisdom",
		description: "Wisdom is not knowledge accumulated but judgment refined. This week we practice seeing more clearly.",
		dbThemeTag:  "wisdom",
	},
	{
		slug: "equanimity", title: "Week of Equanimity",
		description: "The undisturbed mind that meets fortune and misfortune with the same steady attention — this is equanimity.",
		dbThemeTag:  "equanimity",
	},
	{
		slug: "courage", title: "Week of Courage",
		description: "Courage is not the absence of fear but the judgment that something else matters more.",
		dbThemeTag:  "courage",
	},
	{
		slug: "acceptance", title: "Week of Acceptance",
		description: "Amor fati — love of fate. This week we practice meeting what is, rather than fighting what isn't.",
		dbThemeTag:  "acceptance",
	},
	{
		slug: "self-discipline", title: "Week of Self-Discipline",
		description: "The capacity to act in accordance with reason rather than impulse is the foundation of every other virtue.",
		dbThemeTag:  "self_discipline",
	},
	{
		slug: "freedom", title: "Week of Freedom",
		description: "True freedom is inner freedom — the liberation of the mind from fear, desire, and the opinions of others.",
		dbThemeTag:  "freedom",
	},
	{
		slug: "impermanence", title: "Week of Impermanence",
		description: "Everything passes. The Stoic and Buddhist traditions agree: seeing impermanence clearly does not sadden — it frees.",
		dbThemeTag:  "impermanence",
	},
	{
		slug: "perspective", title: "Week of Perspective",
		description: "Step back. See from a higher vantage. Most of what troubles us shrinks to nothing when seen from the right distance.",
		dbThemeTag:  "perspective",
	},
	{
		slug: "service", title: "Week of Service",
		description: "We are made for each other. Marcus Aurelius returned to this again and again: to serve is not a burden but the highest expression of human nature.",
		dbThemeTag:  "service",
	},
	{
		slug: "integrity", title: "Week of Integrity",
		description: "To be the same person in private as in public — to match what you think, say, and do — this is the lifelong project of integrity.",
		dbThemeTag:  "integrity",
	},
	{
		slug: "mindfulness", title: "Week of Mindfulness",
		description: "Return to the present. Every tradition that has produced genuine wisdom begins here: with full attention to what is actually happening.",
		dbThemeTag:  "mindfulness",
	},
	{
		slug: "justice", title: "Week of Justice",
		description: "Justice is not merely legal — it is the lived practice of treating every person as an end in themselves.",
		dbThemeTag:  "justice",
	},
	{
		slug: "control", title: "Week of Control",
		description: "The fundamental Stoic practice: distinguish carefully between what is in your power and what is not, then act accordingly.",
		dbThemeTag:  "control",
	},
	{
		slug: "contemplation", title: "Week of Contemplation",
		description: "Before action, stillness. The contemplative traditions teach that clarity of mind is not a luxury but a necessity for wise action.",
		dbThemeTag:  "contemplation",
	},
	{
		slug: "reason", title: "Week of Reason",
		description: "Logos — the rational principle that structures all things. To live according to reason is to live in accord with the deepest nature of reality.",
		dbThemeTag:  "reason",
	},
	{
		slug: "compassion", title: "Week of Compassion",
		description: "To feel with others rather than merely for them — this is the quality that transforms justice into genuine love.",
		dbThemeTag:  "compassion",
	},
	{
		slug: "transformation", title: "Week of Transformation",
		description: "Philosophy is not study — it is change. This week we sit with the question: what in me needs to be different?",
		dbThemeTag:  "transformation",
	},
	{
		slug: "duty", title: "Week of Duty",
		description: "Kathekon — fitting action. The Stoics had a precise concept: every role we occupy comes with obligations we cannot in good conscience ignore.",
		dbThemeTag:  "duty",
	},
	{
		slug: "inner-strength", title: "Week of Inner Strength",
		description: "Not the strength to dominate others but the strength to remain oneself — stable, clear, and undeceived — in the face of every pressure.",
		dbThemeTag:  "inner_strength",
	},
	{
		slug: "authenticity", title: "Week of Authenticity",
		description: "To live as you truly are, not as convention or fear demands — this is the courage that philosophy calls for most persistently.",
		dbThemeTag:  "authenticity",
	},
	{
		slug: "soul", title: "Week of the Soul",
		description: "What is the soul? Every tradition we study has an answer. This week we sit with the deepest questions about the nature of the self.",
		dbThemeTag:  "soul",
	},
	{
		slug: "meaning", title: "Week of Meaning",
		description: "Viktor Frankl survived Auschwitz because he found meaning in suffering. This week we ask: what gives life weight and direction?",
		dbThemeTag:  "meaning",
	},
	{
		slug: "unity", title: "Week of Unity",
		description: "The Hermetic, Vedantic, and Neoplatonic traditions converge on this: beneath all apparent multiplicity, reality is one.",
		dbThemeTag:  "unity",
	},
	{
		slug: "tranquility", title: "Week of Tranquility",
		description: "Ataraxia — the undisturbed mind. Not the tranquility of one who has never been tested but of one who has worked through to the other side.",
		dbThemeTag:  "tranquility",
	},
}

// MondayOf returns the ISO date string for the Monday of the week containing t.
func MondayOf(t time.Time) string {
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7 // treat Sunday as 7 so Monday is 1
	}
	monday := t.AddDate(0, 0, -(weekday - 1))
	return monday.Format("2006-01-02")
}

// EnsureCurrentWeek creates a Week record for the current week if one doesn't exist.
// Safe to call on every startup — no-op if the week is already seeded.
func EnsureCurrentWeek(db *gorm.DB, weekRepo *repository.WeekRepository, quoteRepo *repository.QuoteRepository) error {
	today := time.Now().UTC()
	startDate := MondayOf(today)

	if weekRepo.ExistsForStartDate(startDate) {
		log.Printf("Weekly theme: week starting %s already exists — skipping", startDate)
		return nil
	}

	return generateWeek(db, weekRepo, quoteRepo, today)
}

func generateWeek(db *gorm.DB, weekRepo *repository.WeekRepository, quoteRepo *repository.QuoteRepository, t time.Time) error {
	_, isoWeek := t.ISOWeek()
	theme := weeklyThemes[isoWeek%len(weeklyThemes)]

	startDate := MondayOf(t)
	// Parse startDate back to time to compute endDate
	monday, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return err
	}
	endDate := monday.AddDate(0, 0, 6).Format("2006-01-02")

	// Collect quote IDs used in the past 4 weeks to avoid repetition
	excludeIDs, err := weekRepo.RecentQuoteIDs(4)
	if err != nil {
		return fmt.Errorf("recent quote IDs: %w", err)
	}

	// Fetch 7 best quotes matching this week's theme tag
	quotes, err := quoteRepo.GetByTheme(theme.dbThemeTag, 7, excludeIDs)
	if err != nil || len(quotes) == 0 {
		// Fallback: fetch top 7 by quality without theme filter
		log.Printf("Weekly theme: no quotes for theme '%s', falling back to top quality", theme.dbThemeTag)
		quotes, err = quoteRepo.GetTopByQuality(7, excludeIDs)
		if err != nil {
			return fmt.Errorf("fallback quotes: %w", err)
		}
	}

	week := &models.Week{
		StartDate:   startDate,
		EndDate:     endDate,
		Theme:       theme.slug,
		Title:       theme.title,
		Description: theme.description,
		Quotes:      quotes,
	}

	if err := weekRepo.Create(week); err != nil {
		return fmt.Errorf("create week: %w", err)
	}

	log.Printf("Weekly theme: created week %s — %s (%d quotes)", startDate, theme.title, len(quotes))
	return nil
}

// StartWeeklyThemeScheduler runs EnsureCurrentWeek on startup and then checks
// every 6 hours whether a new week needs to be generated. No external cron library needed.
func StartWeeklyThemeScheduler(db *gorm.DB, weekRepo *repository.WeekRepository, quoteRepo *repository.QuoteRepository) {
	// Run immediately at startup
	if err := EnsureCurrentWeek(db, weekRepo, quoteRepo); err != nil {
		log.Printf("Weekly theme job error: %v", err)
	}

	// Then check every 6 hours
	go func() {
		ticker := time.NewTicker(6 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := EnsureCurrentWeek(db, weekRepo, quoteRepo); err != nil {
				log.Printf("Weekly theme job error: %v", err)
			}
		}
	}()
}
