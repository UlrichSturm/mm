.PHONY: help dev dev-up dev-down dev-logs up down logs build clean db-reset db-migrate db-seed install test lint

# Colors
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

help: ## Show this help
	@echo ""
	@echo "$(CYAN)Memento Mori - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ===== Development =====

dev: dev-up ## Start development environment (Docker + apps)
	@echo ""
	@echo "$(GREEN)✓ Development services started!$(RESET)"
	@echo ""
	@echo "$(CYAN)Services:$(RESET)"
	@echo "  PostgreSQL:  localhost:5432"
	@echo "  Redis:       localhost:6379"
	@echo "  Keycloak:    http://localhost:8080 (admin/admin)"
	@echo "  Mailhog:     http://localhost:8025"
	@echo "  MinIO:       http://localhost:9001 (minioadmin/minioadmin)"
	@echo ""
	@echo "$(YELLOW)Run 'npm run dev' to start the applications$(RESET)"

dev-up: ## Start development Docker services
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development Docker services
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## Show development Docker logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-restart: dev-down dev-up ## Restart development Docker services

# ===== Production =====

up: ## Start production environment
	docker-compose up -d

down: ## Stop production environment
	docker-compose down

logs: ## Show production logs
	docker-compose logs -f

build: ## Build all Docker images
	docker-compose build

# ===== Database =====

db-reset: ## Reset development database (WARNING: destroys all data)
	@echo "$(YELLOW)Resetting database...$(RESET)"
	docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS memento_mori_dev;"
	docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "CREATE DATABASE memento_mori_dev;"
	docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d memento_mori_dev -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
	@echo "$(GREEN)✓ Database reset complete$(RESET)"

db-migrate: ## Run database migrations
	cd apps/server && npx prisma migrate dev

db-migrate-prod: ## Run database migrations (production)
	cd apps/server && npx prisma migrate deploy

db-seed: ## Seed database with test data
	cd apps/server && npx prisma db seed

db-studio: ## Open Prisma Studio
	cd apps/server && npx prisma studio

db-generate: ## Generate Prisma client
	cd apps/server && npx prisma generate

# ===== Application =====

install: ## Install all dependencies
	npm install
	cd apps/server && npm install
	cd apps/client && npm install
	cd apps/vendor-portal && npm install
	cd apps/admin-portal && npm install
	cd packages/shared && npm install

test: ## Run tests
	cd apps/server && npm run test

test-cov: ## Run tests with coverage
	cd apps/server && npm run test:cov

lint: ## Run linter on all apps
	cd apps/server && npm run lint
	cd apps/client && npm run lint
	cd apps/vendor-portal && npm run lint
	cd apps/admin-portal && npm run lint

format: ## Format code
	npm run format

# ===== Cleanup =====

clean: ## Clean up Docker volumes and images
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(RESET)"

clean-all: clean ## Clean everything including node_modules
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/server/dist
	@echo "$(GREEN)✓ Full cleanup complete$(RESET)"

# ===== Utilities =====

ps: ## Show running containers
	docker-compose -f docker-compose.dev.yml ps

shell-postgres: ## Open PostgreSQL shell
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d memento_mori_dev

shell-redis: ## Open Redis shell
	docker-compose -f docker-compose.dev.yml exec redis redis-cli

