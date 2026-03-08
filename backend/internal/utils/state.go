package utils 

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"
)

// GenerateStateToken generates a random state token for OAuth2
func GenerateStateToken() (string, error) {
	bytes := make([]byte, 32) // 32 bytes = 256 bits
	_, err := rand.Read(bytes)
	if err != nil {
		return "", errors.New("failed to generate state token: " + err.Error())
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

// state storage
var stateStore = make(map[string]time.Time)

// StoreState saves a token with an expiration time
func StoreState(state string)  {
	stateStore[state] = time.Now().Add(10 * time.Minute) // valid for 10 minutes
}

// ValidateState checks if the state token is valid and not expired
func ValidateState(state string) bool {
	expiration, exists := stateStore[state]
	if !exists {
		return false
	}
	if time.Now().After(expiration) {
		delete(stateStore, state) // remove expired state
		return false
	}
	delete(stateStore, state) // remove used state
	return true
}
