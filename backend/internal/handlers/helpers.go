package handlers

// getStringValue safely converts a string pointer to a string value
// Returns empty string if pointer is nil
func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
