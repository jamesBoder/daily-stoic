package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	webpush "github.com/SherClockHolmes/webpush-go"
	"github.com/jamesBoder/daily-stoic/internal/models"
)

type PushService struct {
	publicKey  string
	privateKey string
	subject    string
}

func NewPushService(publicKey, privateKey, subject string) *PushService {
	return &PushService{publicKey: publicKey, privateKey: privateKey, subject: subject}
}

func (s *PushService) Enabled() bool {
	return s.publicKey != "" && s.privateKey != ""
}

type pushPayload struct {
	Title string `json:"title"`
	Body  string `json:"body"`
	Icon  string `json:"icon"`
	URL   string `json:"url"`
}

// send returns (expired, error). expired=true means the subscription endpoint is
// permanently gone (HTTP 410/404) and should be removed from the database.
func (s *PushService) send(sub models.PushSubscription, p pushPayload) (expired bool, err error) {
	body, err := json.Marshal(p)
	if err != nil {
		return false, err
	}

	resp, err := webpush.SendNotification(body, &webpush.Subscription{
		Endpoint: sub.Endpoint,
		Keys: webpush.Keys{
			Auth:   sub.Auth,
			P256dh: sub.P256DH,
		},
	}, &webpush.Options{
		Subscriber:      s.subject,
		VAPIDPublicKey:  s.publicKey,
		VAPIDPrivateKey: s.privateKey,
		TTL:             86400,
	})
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusGone || resp.StatusCode == http.StatusNotFound {
		return true, nil
	}
	return false, nil
}

// SendDailyQuote sends to all subscribers and returns the endpoints that are
// permanently expired so the caller can remove them.
func (s *PushService) SendDailyQuote(subs []models.PushSubscription, quote *models.Quote) []string {
	if !s.Enabled() || len(subs) == 0 {
		return nil
	}
	// “ = " (left double quotation mark), ” = " (right), — = em dash
	body := fmt.Sprintf("“%s” — %s", quote.Text, quote.Author.Name)
	if len(body) > 140 {
		body = body[:137] + "…"
	}
	p := pushPayload{
		Title: "DailyXam",
		Body:  body,
		Icon:  "/logo192.png",
		URL:   "/",
	}
	var failed int
	var expiredEndpoints []string
	for _, sub := range subs {
		expired, err := s.send(sub, p)
		if err != nil {
			log.Printf("push: failed to send to endpoint %s: %v", sub.Endpoint[:min(40, len(sub.Endpoint))], err)
			failed++
		} else if expired {
			expiredEndpoints = append(expiredEndpoints, sub.Endpoint)
		}
	}
	if len(expiredEndpoints) > 0 {
		log.Printf("push: %d expired subscriptions to clean up", len(expiredEndpoints))
	}
	log.Printf("push: daily quote sent to %d/%d subscribers", len(subs)-failed-len(expiredEndpoints), len(subs))
	return expiredEndpoints
}
