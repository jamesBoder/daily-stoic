resource "aws_s3_bucket" "frontend" {
  bucket = local.frontend_bucket_name  # defined in main.tf, auto-derived from account ID

  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}

# Encrypt objects at rest with SSE-S3 (AES-256, AWS managed key, free)
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# All public access blocked — CloudFront uses OAC (signed requests), not public URLs
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# Bucket policy: only this CloudFront distribution can read objects
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.s3_cloudfront_read.json

  # Must wait for public access block before applying a bucket policy,
  # otherwise AWS rejects the policy attachment
  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

data "aws_iam_policy_document" "s3_cloudfront_read" {
  statement {
    sid = "AllowCloudFrontOAC"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}