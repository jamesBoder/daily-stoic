package services

import (
	"encoding/json"
	"fmt"
	"log"

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

func (s *PushService) send(sub models.PushSubscription, p pushPayload) error {
	body, err := json.Marshal(p)
	if err != nil {
		return err
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
		return err
	}
	defer resp.Body.Close()
	return nil
}

func (s *PushService) SendDailyQuote(subs []models.PushSubscription, quote *models.Quote) {
	if !s.Enabled() || len(subs) == 0 {
		return
	}
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
	for _, sub := range subs {
		if err := s.send(sub, p); err != nil {
			log.Printf("push: failed to send to endpoint %s: %v", sub.Endpoint[:min(40, len(sub.Endpoint))], err)
			failed++
		}
	}
	log.Printf("push: daily quote sent to %d/%d subscribers", len(subs)-failed, len(subs))
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
