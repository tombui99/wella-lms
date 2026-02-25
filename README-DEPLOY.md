# Bifrost LMS: AWS Deployment Guide

This guide provides step-by-step instructions for hosting the Bifrost LMS on AWS. This setup is optimized for cost (utilizing the AWS Free Tier where possible) and is suitable for less than 300 users.

## Prerequisites

1. An AWS Account.
2. GitHub account with the project repository.
3. AWS CLI installed and configured (optional, but recommended).

---

## Step 1: Database Setup (AWS RDS)

We will use **AWS RDS (MySQL)** because it's managed and has a generous free tier.

1. Go to the [RDS Console](https://console.aws.amazon.com/rds/).
2. Click **Create database**.
3. Choose **Standard create**.
4. Engine options: **MySQL**.
5. Templates: **Free Tier** (Crucial for cost optimization).
6. Settings:
   - DB instance identifier: `bifrost-lms-db`
   - Master username: `admin`
   - Master password: `YourSecurePassword` (Save this!)
7. Connectivity:
   - Public access: **Yes** (For easy initial setup, you can restrict this later).
   - Create a new VPC security group: `bifrost-lms-sg`.
8. Click **Create database**.
9. Once created, note the **Endpoint**.

---

## Step 2: Backend Hosting (AWS App Runner)

App Runner is the easiest way to deploy containerized .NET applications on AWS.

### 2.1 Create an ECR Repository

1. Go to [Amazon ECR](https://console.aws.amazon.com/ecr/).
2. Create a repository named `bifrost-lms-backend`.

### 2.2 Create App Runner Service

1. Go to [AWS App Runner](https://console.aws.amazon.com/apprunner/).
2. Click **Create service**.
3. Source: **Container registry**, Provider: **Amazon ECR**.
4. Image repository: Select `bifrost-lms-backend`.
5. Deployment settings: **Automatic**.
6. Configuration:
   - Service name: `bifrost-lms-api`
   - Virtual CPU & Memory: `1 vCPU & 2 GB` (Smallest available).
   - Environment variables:
     - `ConnectionStrings__DefaultConnection`: `Server=[YOUR_RDS_ENDPOINT];Database=bifrost_lms;Uid=admin;Pwd=[YOUR_PASSWORD];`
     - `ASPNETCORE_ENVIRONMENT`: `Production`

---

## Step 3: Frontend Hosting (AWS S3 + CloudFront)

For the frontend, we use static site hosting for maximum performance and minimum cost.

### 3.1 Create S3 Bucket

1. Go to [Amazon S3](https://console.aws.amazon.com/s3/).
2. Create bucket: `bifrost-lms-frontend-[unique-id]`.
3. Enable **Static website hosting** in Properties.

### 3.2 Create CloudFront Distribution

1. Go to [CloudFront](https://console.aws.amazon.com/cloudfront/).
2. Click **Create distribution**.
3. Origin domain: Select your S3 bucket.
4. Origin access: **Origin access control settings (recommended)**.
5. Viewer protocol policy: **Redirect HTTP to HTTPS**.
6. Default root object: `index.html`.

---

## Step 4: CI/CD Setup (GitHub Actions)

We will automate the deployment using GitHub Actions.

### 4.1 GitHub Secrets

In your GitHub Repository, go to **Settings > Secrets and variables > Actions** and add:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., `us-east-1`)
- `RDS_ENDPOINT`
- `RDS_PASSWORD`

### 4.2 Automation Workflows

The project includes `.github/workflows/` files that will automatically:

- Build and push the Backend to ECR/App Runner on every push to `main`.
- Build and upload the Frontend to S3 on every push to `main`.

---

## Cost Estimation (Approximate)

- **RDS (Free Tier)**: $0 (for 12 months).
- **App Runner**: ~$25-30/month (depending on usage).
- **S3 + CloudFront**: ~$1-2/month.
- **Total**: ~$30/month.

> [!TIP]
> To further reduce costs, you can set the App Runner "Automatic Scaling" to 1 instance max.

## Database Migrations

The project is configured to automatically apply EF Core Migrations on startup (see `DbInitializer.cs`). You don't need to manually run `dotnet ef database update` on AWS; the backend will update the RDS schema automatically whenever a new version is deployed.
