package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// PhilosophyAPIService fetches philosopher metadata from philosophyapi.com.
// Used during seeding to enrich author records. Not called at request time.
type PhilosophyAPIService struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

func NewPhilosophyAPIService(baseURL, apiKey string) *PhilosophyAPIService {
	return &PhilosophyAPIService{
		baseURL: baseURL,
		apiKey:  apiKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type PhilosopherAPIResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Born        string `json:"born"`
	Died        string `json:"died"`
	Nationality string `json:"nationality"`
	Bio         string `json:"bio"`
}

// GetPhilosopher fetches metadata for a philosopher by slug.
// Returns nil, nil if not found (non-fatal — seed data covers known authors).
func (s *PhilosophyAPIService) GetPhilosopher(slug string) (*PhilosopherAPIResponse, error) {
	url := fmt.Sprintf("%s/philosophers/%s", s.baseURL, slug)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	if s.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+s.apiKey)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		log.Printf("PhilosophyAPIService: network error for %s: %v", slug, err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return nil, nil // Not found — caller uses seed data fallback
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("philosophy API returned %d for %s", resp.StatusCode, slug)
	}

	var result PhilosopherAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return &result, nil
}
