package jobs

import (
	"log"
	"time"

	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

// StartDailyPushScheduler sends a push notification at 08:00 UTC every day.
func StartDailyPushScheduler(pushRepo *repository.PushRepository, pushSvc *services.PushService, dailyQuoteSvc *services.DailyQuoteService) {
	if !pushSvc.Enabled() {
		log.Println("push: VAPID keys not configured — daily push notifications disabled")
		return
	}

	go func() {
		for {
			now := time.Now().UTC()
			next := time.Date(now.Year(), now.Month(), now.Day(), 8, 0, 0, 0, time.UTC)
			if !next.After(now) {
				next = next.Add(24 * time.Hour)
			}
			time.Sleep(time.Until(next))

			quote, err := dailyQuoteSvc.GetDailyQuote()
			if err != nil {
				log.Printf("push: could not get daily quote: %v", err)
				continue
			}

			subs, err := pushRepo.FindAllActive()
			if err != nil {
				log.Printf("push: could not fetch subscriptions: %v", err)
				continue
			}

			expired := pushSvc.SendDailyQuote(subs, quote)
			for _, endpoint := range expired {
				if err := pushRepo.DeleteByEndpointAdmin(endpoint); err != nil {
					log.Printf("push: failed to remove expired subscription: %v", err)
				}
			}
		}
	}()
	log.Println("push: daily push scheduler started (fires at 08:00 UTC)")
}
