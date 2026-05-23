variable "aws_region" {
  default = "us-east-1"
}

variable "github_repo" {
  description = "GitHub owner/repo — scopes the IAM role trust policy to this repo's main branch only"
  default     = "jamesboder/daily-stoic"
}

variable "backend_url" {
  description = "Fly.io backend URL — used in the CloudFront CSP header"
  default     = "https://dailystoic-backend.fly.dev"
}