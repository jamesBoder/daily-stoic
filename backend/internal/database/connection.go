package database

import (
    "fmt"
    "os"
    "strings"
    "time"
    "github.com/jamesBoder/daily-stoic/internal/config"

    "gorm.io/gorm/logger"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)



func Connect(config *config.Config) (*gorm.DB, error) {

    // Prefer DATABASE_URL if set (Fly.io postgres attach sets this automatically)
    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s connect_timeout=15",
            config.DBHost, config.DBPort, config.DBUser,
            config.DBPassword, config.DBName, config.DBSSLMode)
    } else {
        // Append connect_timeout so new connections fail fast rather than hanging
        // indefinitely after Fly.io machine stop/start cycles.
        if !strings.Contains(dsn, "connect_timeout") {
            if strings.Contains(dsn, "?") {
                dsn += "&connect_timeout=15"
            } else {
                dsn += "?connect_timeout=15"
            }
        }
    }

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        // logger : logger.Default.LogMode(logger.Info),
        Logger : logger.Default.LogMode(logger.Info),
        NowFunc: func() time.Time {
        return time.Now().UTC()  // Use UTC timestamps
        },
        PrepareStmt: true,  // Cache prepared statements
    })
    
    if err != nil {
        return nil, err
    }

    
    // Configure connection pool
    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    sqlDB.SetConnMaxIdleTime(2 * time.Minute)

    return db, nil
}
