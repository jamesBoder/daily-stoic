output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.id  # resolves to local.frontend_bucket_name
  description = "Add as GitHub Actions variable FRONTEND_BUCKET"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "Add as GitHub Actions variable CLOUDFRONT_DISTRIBUTION_ID"
}

output "cloudfront_domain" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "Public URL to test the app before cutting over DNS"
}

output "github_deploy_role_arn" {
  value       = aws_iam_role.github_deploy.arn
  description = "Add as GitHub Actions variable AWS_ROLE_ARN"
}

output "aws_region" {
  value = var.aws_region
}

output "route53_nameservers" {
  description = "Paste all four into Namecheap → Domains → Nameservers → Custom DNS"
  value       = aws_route53_zone.main.name_servers
}

output "custom_domain" {
  description = "Live domain once nameservers propagate and cert validates"
  value       = "https://${var.domain_name}"
}

output "sns_alerts_topic_arn" {
  description = "SNS topic ARN for alarm notifications — confirm the subscription email before alarms will deliver"
  value       = aws_sns_topic.alerts.arn
}

output "backend_health_check_id" {
  description = "Route 53 health check ID for the Fly.io backend"
  value       = aws_route53_health_check.backend.id
}