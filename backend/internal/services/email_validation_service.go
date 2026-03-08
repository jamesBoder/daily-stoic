package services

import (
	"os"
	"strings"
)

// EmailValidationService handles email validation logic
type EmailValidationService struct {
	allowTestEmails bool
	testDomains     []string
}

// NewEmailValidationService creates a new email validation service
func NewEmailValidationService() *EmailValidationService {
	// Read configuration from environment
	allowTestEmails := os.Getenv("ALLOW_TEST_EMAILS") == "true"
	
	// Parse test domains from environment
	testDomainsStr := os.Getenv("TEST_EMAIL_DOMAINS")
	if testDomainsStr == "" {
		testDomainsStr = "test.local,example.com,test.com"
	}
	testDomains := strings.Split(testDomainsStr, ",")
	
	// Trim whitespace from domains
	for i := range testDomains {
		testDomains[i] = strings.TrimSpace(testDomains[i])
	}
	
	return &EmailValidationService{
		allowTestEmails: allowTestEmails,
		testDomains:     testDomains,
	}
}

// ValidateEmail validates an email address
// Returns (isValid bool, suggestion string, error string)
func (s *EmailValidationService) ValidateEmail(email string) (bool, string, string) {
	email = strings.ToLower(strings.TrimSpace(email))
	
	// Extract domain from email
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false, "", "Invalid email format"
	}
	
	domain := parts[1]
	
	// Check if it's a test email (allowed in dev mode)
	if s.allowTestEmails && s.isTestDomain(domain) {
		return true, "", ""
	}
	
	// Check for disposable email domains
	if s.isDisposableDomain(domain) {
		return false, "", "Please use a valid, non-disposable email address"
	}
	
	// Check for common typos and suggest corrections
	if suggestion := s.suggestDomainCorrection(domain); suggestion != "" {
		return false, suggestion, "Did you mean " + suggestion + "?"
	}
	
	return true, "", ""
}

// isTestDomain checks if the domain is in the test domains list
func (s *EmailValidationService) isTestDomain(domain string) bool {
	for _, testDomain := range s.testDomains {
		if domain == testDomain {
			return true
		}
	}
	return false
}

// isDisposableDomain checks if the domain is a known disposable email service
func (s *EmailValidationService) isDisposableDomain(domain string) bool {
	// List of common disposable email domains
	disposableDomains := []string{
		// Popular disposable email services
		"mailinator.com", "guerrillamail.com", "10minutemail.com",
		"temp-mail.org", "throwaway.email", "maildrop.cc",
		"tempmail.com", "getnada.com", "trashmail.com",
		"fakeinbox.com", "yopmail.com", "mohmal.com",
		"sharklasers.com", "guerrillamailblock.com", "pokemail.net",
		"spam4.me", "grr.la", "guerrillamail.biz",
		"guerrillamail.de", "guerrillamail.net", "guerrillamail.org",
		"mailnesia.com", "mintemail.com", "mytemp.email",
		"tempinbox.com", "emailondeck.com", "throwawaymail.com",
		"dispostable.com", "fakemailgenerator.com", "mailcatch.com",
		"mailnator.com", "spamgourmet.com", "tempail.com",
		"tempr.email", "10mail.org", "20minutemail.com",
		"anonbox.net", "binkmail.com", "bobmail.info",
		"bugmenot.com", "deadaddress.com", "despam.it",
		"disposeamail.com", "dodgeit.com", "e4ward.com",
		"emailias.com", "emz.net", "filzmail.com",
		"getairmail.com", "gishpuppy.com", "guerrillamail.com",
		"hidemail.de", "incognitomail.com", "jetable.org",
		"kasmail.com", "link2mail.net", "mailexpire.com",
		"mailin8r.com", "mailinator2.com", "mailmetrash.com",
		"mailmoat.com", "mailnull.com", "meltmail.com",
		"mintemail.com", "mt2009.com", "mytrashmail.com",
		"neverbox.com", "nobulk.com", "no-spam.ws",
		"nospam.ze.tc", "nospamfor.us", "nowmymail.com",
		"objectmail.com", "obobbo.com", "oneoffemail.com",
		"pookmail.com", "proxymail.eu", "put2.net",
		"quickinbox.com", "rcpt.at", "recode.me",
		"recursor.net", "regbypass.com", "safe-mail.net",
		"safetymail.info", "sandelf.de", "selfdestructingmail.com",
		"sendspamhere.com", "shiftmail.com", "skeefmail.com",
		"slaskpost.se", "slopsbox.com", "smellfear.com",
		"snakemail.com", "sneakemail.com", "sofort-mail.de",
		"sogetthis.com", "soodonims.com", "spam.la",
		"spamavert.com", "spambob.com", "spambog.com",
		"spambog.de", "spambog.ru", "spambox.us",
		"spamcannon.com", "spamcannon.net", "spamcon.org",
		"spamcorptastic.com", "spamcowboy.com", "spamcowboy.net",
		"spamcowboy.org", "spamday.com", "spamex.com",
		"spamfree24.com", "spamfree24.de", "spamfree24.eu",
		"spamfree24.info", "spamfree24.net", "spamfree24.org",
		"spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
		"spamhole.com", "spamify.com", "spaminator.de",
		"spamkill.info", "spaml.com", "spaml.de",
		"spammotel.com", "spamobox.com", "spamspot.com",
		"spamthis.co.uk", "spamthisplease.com", "speed.1s.fr",
		"supergreatmail.com", "supermailer.jp", "suremail.info",
		"teewars.org", "teleworm.com", "teleworm.us",
		"temp-mail.com", "temp-mail.de", "temp-mail.org",
		"temp-mail.ru", "tempemail.biz", "tempemail.com",
		"tempemail.net", "tempinbox.co.uk", "tempinbox.com",
		"tempmail.eu", "tempmail.it", "tempmail2.com",
		"tempmaildemo.com", "tempmailer.com", "tempmailer.de",
		"tempomail.fr", "temporarily.de", "temporarioemail.com.br",
		"temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com",
		"temporaryinbox.com", "temporarymailaddress.com", "thanksnospam.info",
		"thankyou2010.com", "thisisnotmyrealemail.com", "throwawayemailaddress.com",
		"tilien.com", "tmailinator.com", "tradermail.info",
		"trash-amil.com", "trash-mail.at", "trash-mail.com",
		"trash-mail.de", "trash2009.com", "trashemail.de",
		"trashmail.at", "trashmail.com", "trashmail.de",
		"trashmail.me", "trashmail.net", "trashmail.org",
		"trashmail.ws", "trashmailer.com", "trashymail.com",
		"trashymail.net", "trillianpro.com", "twinmail.de",
		"tyldd.com", "uggsrock.com", "wegwerfadresse.de",
		"wegwerfemail.de", "wegwerfmail.de", "wegwerfmail.net",
		"wegwerfmail.org", "wh4f.org", "whyspam.me",
		"willselfdestruct.com", "winemaven.info", "wronghead.com",
		"wuzup.net", "wuzupmail.net", "www.e4ward.com",
		"www.gishpuppy.com", "www.mailinator.com", "wwwnew.eu",
		"xagloo.com", "xemaps.com", "xents.com",
		"xmaily.com", "xoxy.net", "yep.it",
		"yogamaven.com", "yopmail.com", "yopmail.fr",
		"yopmail.net", "yourdomain.com", "yuurok.com",
		"zehnminuten.de", "zehnminutenmail.de", "zippymail.info",
		"zoemail.com", "zoemail.net", "zoemail.org",
	}
	
	for _, disposable := range disposableDomains {
		if domain == disposable {
			return true
		}
	}
	
	return false
}

// suggestDomainCorrection suggests corrections for common typos
func (s *EmailValidationService) suggestDomainCorrection(domain string) string {
	// Map of common typos to correct domains
	corrections := map[string]string{
		// Gmail typos
		"gmial.com":     "gmail.com",
		"gmai.com":      "gmail.com",
		"gmil.com":      "gmail.com",
		"gmaill.com":    "gmail.com",
		"gmailcom":      "gmail.com",
		"gnail.com":     "gmail.com",
		"gmal.com":      "gmail.com",
		
		// Yahoo typos
		"yaho.com":      "yahoo.com",
		"yahooo.com":    "yahoo.com",
		"yahoocom":      "yahoo.com",
		"ymail.com":     "yahoo.com",
		
		// Outlook/Hotmail typos
		"hotmial.com":   "hotmail.com",
		"hotmai.com":    "hotmail.com",
		"hotmailcom":    "hotmail.com",
		"outlok.com":    "outlook.com",
		"outloo.com":    "outlook.com",
		"outlookcom":    "outlook.com",
		
		// Other common providers
		"aol.co":        "aol.com",
		"aolcom":        "aol.com",
		"icloud.co":     "icloud.com",
		"icloudcom":     "icloud.com",
		"protonmai.com": "protonmail.com",
		"protonmailcom": "protonmail.com",
	}
	
	if correction, exists := corrections[domain]; exists {
		return correction
	}
	
	return ""
}
