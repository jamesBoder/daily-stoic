package repository

import (
	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

type QuoteRepository struct {
	db *gorm.DB
}

func NewQuoteRepository(db *gorm.DB) *QuoteRepository {
	return &QuoteRepository{db: db}
}

func (r *QuoteRepository) GetByDate(date string) (*models.Quote, error) {
	var quote models.Quote
	err := r.db.Where("daily_date = ?", date).
		Preload("Author").
		Preload("Tradition").
		First(&quote).Error
	if err != nil {
		return nil, err
	}
	return &quote, nil
}

func (r *QuoteRepository) GetByID(id uint) (*models.Quote, error) {
	var quote models.Quote
	err := r.db.Preload("Author").Preload("Tradition").First(&quote, id).Error
	if err != nil {
		return nil, err
	}
	return &quote, nil
}

func (r *QuoteRepository) GetAll(tier string) ([]models.Quote, error) {
	var quotes []models.Quote
	query := r.db.Preload("Author").Preload("Tradition")
	if tier != "" {
		query = query.Where("tier = ?", tier)
	}
	err := query.Find(&quotes).Error
	return quotes, err
}

func (r *QuoteRepository) GetByAuthor(authorID uint) ([]models.Quote, error) {
	var quotes []models.Quote
	err := r.db.Where("author_id = ?", authorID).
		Preload("Author").Preload("Tradition").
		Find(&quotes).Error
	return quotes, err
}

// GetRecentDates returns the last N daily_date values assigned to quotes (descending).
func (r *QuoteRepository) GetRecentDates(days int) ([]string, error) {
	var dates []string
	err := r.db.Model(&models.Quote{}).
		Where("daily_date IS NOT NULL").
		Order("daily_date DESC").
		Limit(days).
		Pluck("daily_date", &dates).Error
	return dates, err
}

func (r *QuoteRepository) AssignDate(quoteID uint, date string) error {
	return r.db.Model(&models.Quote{}).
		Where("id = ?", quoteID).
		Update("daily_date", date).Error
}

// GetFreeQuotesWithoutDate returns free-tier quotes that have not yet been assigned a daily_date.
func (r *QuoteRepository) GetFreeQuotesWithoutDate() ([]models.Quote, error) {
	var quotes []models.Quote
	err := r.db.Where("tier = ? AND daily_date IS NULL", "free").Find(&quotes).Error
	return quotes, err
}

// GetAllFreeQuotes returns all free-tier quotes regardless of daily_date assignment.
// Used as a fallback when all quotes have been exhausted in the 90-day window.
func (r *QuoteRepository) GetAllFreeQuotes() ([]models.Quote, error) {
	var quotes []models.Quote
	err := r.db.Where("tier = ?", "free").Find(&quotes).Error
	return quotes, err
}

// GetFreeTraditionSlugs returns the slugs of all free-tier traditions that have at least one quote.
func (r *QuoteRepository) GetFreeTraditionSlugs() ([]string, error) {
	var slugs []string
	err := r.db.Model(&models.Quote{}).
		Select("DISTINCT traditions.slug").
		Joins("JOIN traditions ON traditions.id = quotes.tradition_id").
		Where("quotes.tier = ? AND traditions.tier = ?", "free", "free").
		Pluck("traditions.slug", &slugs).Error
	return slugs, err
}

// GetFreeQuotesByTraditionWithoutDate returns free-tier quotes from a specific tradition
// that have not been assigned a daily_date and are not in the exclusion set.
func (r *QuoteRepository) GetFreeQuotesByTraditionWithoutDate(traditionSlug string, excludeDates map[string]bool) ([]models.Quote, error) {
	var quotes []models.Quote
	err := r.db.
		Joins("JOIN traditions ON traditions.id = quotes.tradition_id").
		Where("quotes.tier = ? AND traditions.slug = ? AND quotes.daily_date IS NULL", "free", traditionSlug).
		Find(&quotes).Error
	if err != nil {
		return nil, err
	}
	filtered := quotes[:0]
	for _, q := range quotes {
		if q.DailyDate == nil || !excludeDates[*q.DailyDate] {
			filtered = append(filtered, q)
		}
	}
	return filtered, nil
}

// GetAllFreeQuotesByTradition returns all free-tier quotes from a specific tradition.
// Used as a per-tradition fallback when the unassigned pool is exhausted.
func (r *QuoteRepository) GetAllFreeQuotesByTradition(traditionSlug string) ([]models.Quote, error) {
	var quotes []models.Quote
	err := r.db.
		Joins("JOIN traditions ON traditions.id = quotes.tradition_id").
		Where("quotes.tier = ? AND traditions.slug = ?", "free", traditionSlug).
		Find(&quotes).Error
	return quotes, err
}

func (r *QuoteRepository) Search(q, tradition, theme, tier string, limit, offset int) ([]models.Quote, int64, error) {
	var quotes []models.Quote
	var total int64

	query := r.db.Model(&models.Quote{}).Preload("Author").Preload("Tradition")

	if q != "" {
		query = query.Where("text ILIKE ?", "%"+q+"%")
	}
	if tradition != "" {
		query = query.Joins("JOIN traditions ON traditions.id = quotes.tradition_id").
			Where("traditions.slug = ?", tradition)
	}
	if theme != "" {
		query = query.Where("themes ILIKE ?", "%"+theme+"%")
	}
	if tier != "" {
		query = query.Where("quotes.tier = ?", tier)
	}

	query.Count(&total)
	err := query.Limit(limit).Offset(offset).Find(&quotes).Error
	return quotes, total, err
}

func (r *QuoteRepository) CountAll() (int64, error) {
	var count int64
	err := r.db.Model(&models.Quote{}).Count(&count).Error
	return count, err
}

// GetByTheme returns up to limit quotes whose themes JSON contains the given tag,
// ordered by quality_score descending, excluding any IDs in excludeIDs.
func (r *QuoteRepository) GetByTheme(themeTag string, limit int, excludeIDs []uint) ([]models.Quote, error) {
	var quotes []models.Quote
	query := r.db.
		Where("themes ILIKE ?", "%"+themeTag+"%").
		Preload("Author").Preload("Tradition").
		Order("quality_score DESC").
		Limit(limit)
	if len(excludeIDs) > 0 {
		query = query.Not("id IN ?", excludeIDs)
	}
	err := query.Find(&quotes).Error
	return quotes, err
}

// GetTopByQuality returns the top N quotes by quality_score, excluding any IDs in excludeIDs.
// Used as a fallback when a theme has too few quotes.
func (r *QuoteRepository) GetTopByQuality(limit int, excludeIDs []uint) ([]models.Quote, error) {
	var quotes []models.Quote
	query := r.db.
		Preload("Author").Preload("Tradition").
		Order("quality_score DESC").
		Limit(limit)
	if len(excludeIDs) > 0 {
		query = query.Not("id IN ?", excludeIDs)
	}
	err := query.Find(&quotes).Error
	return quotes, err
}
