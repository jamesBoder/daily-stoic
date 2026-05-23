# OAC — modern replacement for OAI. Signs every S3 request with SigV4
# so S3 can verify the request genuinely came from this distribution.
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "daily-stoic-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Security headers policy — replicates every header that nginx.fly.conf provided.
# Without this, moving from Nginx to CloudFront silently drops CSP and all
# other security headers, weakening the app's security posture.
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "daily-stoic-security-headers"

  security_headers_config {
    content_type_options {
      override = true  # X-Content-Type-Options: nosniff
    }

    frame_options {
      frame_option = "SAMEORIGIN"  # X-Frame-Options: SAMEORIGIN
      override     = true
    }

    xss_protection {
      mode_block = true  # X-XSS-Protection: 1; mode=block
      protection = true
      override   = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000  # 2 years
      include_subdomains         = true
      preload                    = false     # set true only after domain is stable
      override                   = true
    }

    content_security_policy {
      # Matches frontend/nginx.fly.conf exactly — update both places if CSP changes
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${var.backend_url} https://accounts.google.com https://fonts.googleapis.com https://fonts.gstatic.com; frame-src https://apis.google.com https://accounts.google.com;"
      override                = true
    }
  }
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"

  # PriceClass_100: serves from edge locations in US, Canada, Europe only.
  # Cheapest option. For a global app add PriceClass_200 (adds Asia/Africa/ME).
  price_class = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-frontend"
    viewer_protocol_policy     = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    # min_ttl / default_ttl: apply when the origin returns no Cache-Control header.
    # max_ttl: hard ceiling CloudFront applies even when Cache-Control IS present.
    #   CloudFront TTL = min(max_ttl, Cache-Control max-age)
    #   With max_ttl = 86400 and Cache-Control: max-age=31536000, TTL = 86400 (wrong!)
    #   max_ttl must be >= the longest max-age we send so CloudFront honors immutable caching.
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 31536000  # 1 year — matches immutable asset Cache-Control; allows full edge caching
  }

  # SPA routing — serve index.html for both 403 and 404.
  # IMPORTANT: S3 with OAC (private bucket) returns 403 Forbidden for paths that
  # have no matching object (e.g. /settings, /favorites). React Router routes are
  # not S3 objects. If only 404 is handled, all deep links silently break.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true  # *.cloudfront.net HTTPS, no cost
    # When a custom domain is added: replace with acm_certificate_arn + ssl_support_method = "sni-only"
    # The ACM certificate MUST be in us-east-1 regardless of the app's region — CloudFront requirement
  }

  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}