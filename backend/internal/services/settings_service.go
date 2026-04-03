package services

import (
    "errors"
    "gorm.io/gorm"
    "github.com/jamesBoder/daily-stoic/internal/models"
)

type SettingsService struct {
    db *gorm.DB
}

func NewSettingsService(db *gorm.DB) *SettingsService {
    return &SettingsService{
        db: db,
    }
}

// GetUserSettings retrieves settings for a user, creating default settings if none exist
func (s *SettingsService) GetUserSettings(userID uint) (*models.UserSettings, error) {
    var settings models.UserSettings
    
    err := s.db.Where("user_id = ?", userID).First(&settings).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            // Create default settings for the user
            return s.CreateDefaultSettings(userID)
        }
        return nil, err
    }
    
    return &settings, nil
}

// CreateDefaultSettings creates default settings for a user
func (s *SettingsService) CreateDefaultSettings(userID uint) (*models.UserSettings, error) {
    settings := models.UserSettings{
        UserID:               userID,
        PreferredLanguage:    "en",
        EmailNotifications:   true,
        DailyVerseReminder:   true,
        DarkMode:            false,
    }
    
    if err := s.db.Create(&settings).Error; err != nil {
        // If settings already exist (race condition), try to get them
        var existingSettings models.UserSettings
        if err := s.db.Where("user_id = ?", userID).First(&existingSettings).Error; err == nil {
            return &existingSettings, nil
        }
        return nil, err
    }
    
    return &settings, nil
}

// UpdateUserSettings updates settings for a user
func (s *SettingsService) UpdateUserSettings(userID uint, updates map[string]interface{}) (*models.UserSettings, error) {
    // First ensure settings exist (create if they don't)
    settings, err := s.GetUserSettings(userID)
    if err != nil {
        // If there's an error getting settings, try to create them
        settings = &models.UserSettings{
            UserID:               userID,
            PreferredLanguage:    "en",
            EmailNotifications:   true,
            DailyVerseReminder:   true,
            DarkMode:            false,
        }
        if err := s.db.Create(settings).Error; err != nil {
            return nil, err
        }
    }
    
    // Update only the fields that are provided
    if err := s.db.Model(&settings).Updates(updates).Error; err != nil {
        return nil, err
    }
    
    // Also update the User model's PreferredLanguage if language is being updated
    if lang, ok := updates["preferred_language"].(string); ok {
        if err := s.db.Model(&models.User{}).Where("id = ?", userID).Update("preferred_language", lang).Error; err != nil {
            // Log error but don't fail - settings are still updated
            // This is for backward compatibility with the User model
        }
    }
    
    return settings, nil
}

// GetUserLanguage gets just the language preference for a user
func (s *SettingsService) GetUserLanguage(userID uint) (string, error) {
    var user models.User
    err := s.db.Select("preferred_language").Where("id = ?", userID).First(&user).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return "en", nil // Default to English
        }
        return "", err
    }
    
    if user.PreferredLanguage == "" {
        return "en", nil
    }
    
    return user.PreferredLanguage, nil
}

// UpdateUserLanguage updates just the language preference
func (s *SettingsService) UpdateUserLanguage(userID uint, language string) error {
    // Validate language code
    validLanguages := map[string]bool{
        "en": true,
        "es": true,
        "fr": true,
        "ht": true, // Haitian Creole
    }
    
    if !validLanguages[language] {
        return errors.New("invalid language code")
    }
    
    // Update both User and UserSettings tables
    if err := s.db.Model(&models.User{}).Where("id = ?", userID).Update("preferred_language", language).Error; err != nil {
        return err
    }
    
    // Update or create settings
    _, err := s.UpdateUserSettings(userID, map[string]interface{}{
        "preferred_language": language,
    })
    
    return err
}