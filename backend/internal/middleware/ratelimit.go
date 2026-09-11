package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateVisitor struct {
	count      int
	windowEnds time.Time
}

// ipRateLimiter is a simple per-IP fixed-window rate limiter. It is
// process-local, so it only limits requests hitting a single backend
// instance — fine for the current single-machine Fly.io deployment; if the
// backend is ever scaled horizontally, replace with a shared store (Redis).
type ipRateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*rateVisitor
	limit    int
	window   time.Duration
}

func newIPRateLimiter(limit int, window time.Duration) *ipRateLimiter {
	l := &ipRateLimiter{
		visitors: make(map[string]*rateVisitor),
		limit:    limit,
		window:   window,
	}
	go l.cleanupLoop()
	return l
}

func (l *ipRateLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	v, ok := l.visitors[ip]
	if !ok || now.After(v.windowEnds) {
		l.visitors[ip] = &rateVisitor{count: 1, windowEnds: now.Add(l.window)}
		return true
	}
	if v.count >= l.limit {
		return false
	}
	v.count++
	return true
}

func (l *ipRateLimiter) cleanupLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		l.mu.Lock()
		now := time.Now()
		for ip, v := range l.visitors {
			if now.After(v.windowEnds) {
				delete(l.visitors, ip)
			}
		}
		l.mu.Unlock()
	}
}

// RateLimit returns Gin middleware allowing at most `limit` requests per
// client IP within `window`, rejecting the rest with 429. Intended for
// sensitive, low-volume endpoints (login, registration, password reset) to
// blunt credential-stuffing and mail-bombing abuse.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	l := newIPRateLimiter(limit, window)
	return func(c *gin.Context) {
		if !l.allow(c.ClientIP()) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests, please try again later"})
			return
		}
		c.Next()
	}
}
