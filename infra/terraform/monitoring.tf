# ─── SNS ─────────────────────────────────────────────────────────────────────

resource "aws_sns_topic" "alerts" {
  name = "daily-stoic-alerts"
  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}

# After `terraform apply`, AWS sends a confirmation email to this address.
# Alarms will NOT deliver notifications until you click "Confirm subscription".
resource "aws_sns_topic_subscription" "alert_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ─── CloudFront alarms ────────────────────────────────────────────────────────
# Standard CloudFront metrics are free and published to CloudWatch automatically.
# All CloudFront metrics use Region = "Global" regardless of provider region.

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx" {
  alarm_name        = "daily-stoic-cloudfront-5xx-rate"
  alarm_description = "CloudFront 5xx error rate exceeded 10% for 15 consecutive minutes — likely a bad deploy or broken asset path."
  namespace         = "AWS/CloudFront"
  metric_name       = "5xxErrorRate"
  dimensions = {
    DistributionId = aws_cloudfront_distribution.frontend.id
    Region         = "Global"
  }

  statistic           = "Average"
  period              = 300   # 5 minutes
  evaluation_periods  = 3     # must breach for 15 consecutive minutes — avoids noise from a single bad request at low traffic
  threshold           = 10    # percent — at low traffic 1 error in 10 requests = 10%; below this is likely a fluke
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching" # no requests = no errors

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_cache_hit" {
  alarm_name        = "daily-stoic-cloudfront-cache-hit-rate"
  alarm_description = "CloudFront cache hit rate below 30% for 2 hours — something is systematically bypassing the cache (wrong headers, new uncached route)."
  namespace         = "AWS/CloudFront"
  metric_name       = "CacheHitRate"
  dimensions = {
    DistributionId = aws_cloudfront_distribution.frontend.id
    Region         = "Global"
  }

  statistic           = "Average"
  period              = 1800  # 30 minutes
  evaluation_periods  = 4     # must breach for 2 consecutive hours — cache is always low after a deploy; this catches systematic misconfiguration, not post-deploy noise
  threshold           = 30    # percent — anything above 30% is expected volatility at low traffic; below 30% sustained is genuinely wrong
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}

# ─── Route 53 health check ────────────────────────────────────────────────────

resource "aws_route53_health_check" "backend" {
  # Strip the scheme so Route 53 gets a bare hostname
  fqdn             = replace(var.backend_url, "https://", "")
  port             = 443
  type             = "HTTPS"
  resource_path    = "/health"
  request_interval = 30  # seconds between probes
  failure_threshold = 3  # consecutive failures before marking unhealthy (~90 seconds)

  # Required for Fly.io: uses SNI-based TLS; without this the TLS handshake
  # fails immediately and every probe reports unhealthy regardless of app state.
  enable_sni = true

  tags = {
    Name      = "daily-stoic-backend"
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}

# Route 53 health check metrics live in us-east-1 regardless of provider region.
# HealthCheckStatus = 1 (healthy) or 0 (unhealthy).
# Timeline: 3 failed probes × 30s = ~90s to go unhealthy, then 2 × 60s alarm
# evaluation = notification fires ~3–4 minutes after the backend actually goes down.
# This gives Fly.io time to restart a machine without paging you on every deploy.
resource "aws_cloudwatch_metric_alarm" "backend_health" {
  alarm_name        = "daily-stoic-backend-health"
  alarm_description = "Fly.io backend /health has been failing for ~4 minutes — the API is likely down, not just restarting."
  namespace         = "AWS/Route53"
  metric_name       = "HealthCheckStatus"
  dimensions = {
    HealthCheckId = aws_route53_health_check.backend.id
  }

  statistic           = "Minimum"
  period              = 60    # 1 minute
  evaluation_periods  = 2     # fires ~3–4 min after backend goes down; absorbs brief Fly.io restarts
  threshold           = 1
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "breaching" # can't reach metric = assume down

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}
