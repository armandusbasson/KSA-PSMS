# Security & API Key Setup Guide

## GitHub Repository Security

### 1. GitHub Secrets Configuration

Go to **GitHub.com → Your Repository → Settings → Secrets and variables → Actions**

Add the following secrets for CI/CD pipelines:

```
DOCKER_USERNAME           # Your Docker Hub username
DOCKER_PASSWORD           # Your Docker Hub password/token
DEPLOYMENT_KEY            # SSH key for deployment server (if applicable)
DATABASE_URL_PROD         # Production database URL
API_KEY_PROD              # Production API key (if needed)
```

### 2. Branch Protection Rules

Go to **Settings → Branches → Add branch protection rule**

For the `main` branch, enable:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Dismiss stale pull request approvals
- ✅ Require code reviews before merging (recommend 1 reviewer)

### 3. Repository Settings Security

**Settings → Security and analysis:**
- Enable **Dependabot alerts** (to track vulnerable dependencies)
- Enable **Dependabot security updates** (auto-create PRs for vulnerabilities)
- Enable **Secret scanning** (to detect exposed credentials)

## Environment Variables Setup

### Backend (.env)
```
# Development
DATABASE_URL=sqlite:///./app.db
DEBUG=true
ENVIRONMENT=development

# Production
DATABASE_URL=postgresql://user:password@host:5432/ksa_psms
DEBUG=false
ENVIRONMENT=production
API_TITLE=Kulkoni SA Power Station Management API
API_VERSION=1.0.0
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000  # Development
VITE_API_URL=https://api.your-domain.com  # Production
```

## Docker Security

### Never commit:
- `.env` files with real credentials
- Docker secrets or API keys
- Database credentials

### Use environment files only for development:
```bash
docker-compose --env-file .env.development up
```

## API Key Management

If you need to add API authentication:

1. **Generate secure API keys:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Store in GitHub Secrets** (not in code)

3. **Access in GitHub Actions:**
   ```yaml
   - name: Deploy
     env:
       API_KEY: ${{ secrets.API_KEY }}
     run: ./deploy.sh
   ```

## Recommended Next Steps

1. **Set up branch protection** to require PR reviews
2. **Enable Dependabot** for automatic security updates
3. **Configure GitHub Secrets** for any API keys you use
4. **Add code scanning** (GitHub Advanced Security)
5. **Set up CODEOWNERS** to specify who reviews changes

## Sensitive Files (.gitignore)

The `.gitignore` already includes:
- `.env` files (environment variables)
- `node_modules/` and `__pycache__/` (dependencies)
- Build artifacts (`dist/`)
- IDE settings (`.vscode/`, `.idea/`)

## Regular Security Checks

- Review GitHub Security tab monthly
- Update dependencies regularly via Dependabot
- Rotate API keys/tokens quarterly
- Audit who has repository access
