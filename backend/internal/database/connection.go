package database

import (
    "fmt"
    "time"
    "github.com/jamesBoder/daily-stoic/internal/config"

    "gorm.io/gorm/logger"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)



func Connect(config *config.Config) (*gorm.DB, error) {

    dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
    config.DBHost, config.DBPort, config.DBUser, 
    config.DBPassword, config.DBName, config.DBSSLMode)

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
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db, nil
}
