package middleware

import(
	"log"
	"github.com/gin-gonic/gin"
	
)

// implement error handler middleware to -
// Catch panics and recover
// Return consistent error format
// Log errors for debugging
// Don't expose internal details

func ErrorHandler() gin.HandlerFunc {
	return func (c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error
				log.Printf("Panic recovered: %v", err)

				// Return a generic error response
				c.JSON(500, gin.H{
					"error": "Internal Server Error",
				})
				c.Abort()

				//
			}
		}()
		// Continue to next middleware/handler
		c.Next()

		// Check for errors set during request processing
		if len(c.Errors) > 0 {
			// Log the errors
			for _, e := range c.Errors {
				log.Printf("Error: %v", e.Err)
			}

			// Return a generic error response
			c.JSON(500, gin.H{
				"error": "Internal Server Error",
			})
			c.Abort()
		}

		// No errors, proceed normally
	}
}