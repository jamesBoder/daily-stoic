terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Empty backend block — all values are supplied at `terraform init` time via
  # -backend-config flags (see §5). This avoids hardcoding your account ID in
  # a committed file, and Terraform backend blocks cannot use variables anyway.
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  # No profile hardcoded — relies on AWS_PROFILE env var set before running Terraform.
  # Hardcoding profile would break any future CI run (OIDC credentials have no profile name).
}

# Shared data source — used by locals (bucket name) and iam_oidc.tf (role policy ARN).
# Defined here in main.tf so it is clearly a module-wide shared resource.
data "aws_caller_identity" "current" {}

locals {
  # Auto-derive a globally unique frontend bucket name from the AWS account ID.
  # This eliminates the need for a terraform.tfvars file for this value.
  frontend_bucket_name = "daily-stoic-frontend-${data.aws_caller_identity.current.account_id}"
}