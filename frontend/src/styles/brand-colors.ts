// Fixed external brand colors — exempt from the no-hex-in-components rule.
// These never change with the theme; import BRAND instead of inlining magic strings.
export const BRAND = {
  googleBlue:        '#4285F4',
  googleRed:         '#EA4335',
  googleYellow:      '#FBBC05',
  googleGreen:       '#34A853',
  whatsapp:          '#25D366',
  whatsappHover:     '#1ebe5d',
  facebook:          '#1877F2',
  facebookHover:     '#166fe5',
  instaFrom:         '#f9ce34',
  instaVia:          '#ee2a7b',
  instaTo:           '#6228d7',
} as const
