# Note: data "aws_caller_identity" "current" is defined in main.tf (shared resource).

# GitHub Actions OIDC provider — one per AWS account (not one per repo).
# If other projects in the same account use GitHub Actions OIDC, they share this provider.
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]

  # SHA-1 thumbprint of GitHub's OIDC TLS root certificate.
  # AWS now validates GitHub's OIDC tokens via GitHub's JWKS endpoint, so the thumbprint
  # is not strictly enforced — but the field is required by the Terraform resource.
  # Current thumbprint (as of 2023 certificate rotation): 1c58a3a8518e8759bf075b76b750d4f2df264fcd
  # To recompute: openssl s_client -servername token.actions.githubusercontent.com \
  #   -connect token.actions.githubusercontent.com:443 < /dev/null 2>/dev/null \
  #   | openssl x509 -fingerprint -noout | tr -d ':' | tr 'A-F' 'a-f' | cut -d= -f2
  thumbprint_list = ["1c58a3a8518e8759bf075b76b750d4f2df264fcd"]
}

# IAM role that GitHub Actions assumes via OIDC on every cd.yml run
resource "aws_iam_role" "github_deploy" {
  name = "github-actions-daily-stoic"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          # Audience must be sts.amazonaws.com (set by configure-aws-credentials action)
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          # StringEquals (not StringLike) for exact match — the value has no wildcards.
          # StringLike would also allow wildcard patterns and is less precise here.
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:ref:refs/heads/main"
        }
      }
    }]
  })

  tags = {
    Project   = "daily-stoic"
    ManagedBy = "terraform"
  }
}

# Tightly scoped policy — write to S3 and invalidate CloudFront, nothing else.
# Three statements with correct resource scopes:
#   s3:ListBucket            → bucket ARN only (bucket-level action, /* is ignored by AWS)
#   s3:PutObject             → objects only (/* required — these are object-level actions)
#   s3:DeleteObject          → objects only
#   cloudfront:CreateInvalidation → specific distribution ARN (only this action, nothing broader)
resource "aws_iam_role_policy" "github_deploy" {
  name = "deploy-frontend"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3FrontendList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.frontend.arn  # bucket-level action — no /* suffix
      },
      {
        Sid      = "S3FrontendObjects"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.frontend.arn}/*"  # object-level actions — /* required
      },
      {
        Sid      = "CloudFrontInvalidate"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${aws_cloudfront_distribution.frontend.id}"
      }
    ]
  })
}