package middleware

import (
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

// implement logger middleware to - Log every incoming request
// - Log response status and time
// - Use structured logging (JSON format)
// - Include request ID

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// Process request
		c.Next()

		// Log details
		endTime := time.Now()
		latency := endTime.Sub(startTime)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		path := c.Request.URL.Path
		requestID := c.GetString("RequestID") // Assuming you set this somewhere

		// Structured log in JSON format
		log.Printf(`{"time":"%s","status":%d,"latency":"%s","client_ip":"%s","method":"%s","path":"%s","request_id":"%s"}`,
			endTime.Format(time.RFC3339), statusCode, latency, clientIP, method, path, requestID)
	}
}

// To use this middleware, add it to your Gin router:
// router := gin.New()
// router.Use(middleware.Logger())
