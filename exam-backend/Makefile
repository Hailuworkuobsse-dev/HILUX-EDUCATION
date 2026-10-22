.PHONY: help install db-up db-down migrate seed seed-all dev build start test typecheck reset clean

help:
	@echo "ExamPrep backend — common commands"
	@echo ""
	@echo "  make install     Install dependencies"
	@echo "  make db-up       Start MySQL (docker compose)"
	@echo "  make db-down     Stop MySQL"
	@echo "  make migrate     Run prisma migrate dev"
	@echo "  make seed        Seed base data (subjects + users)"
	@echo "  make seed-all    Run all seeds (base + mentor + teacher + admin)"
	@echo "  make dev         Start dev server"
	@echo "  make build       Build for production"
	@echo "  make start       Start compiled server"
	@echo "  make test        Run tests"
	@echo "  make typecheck   TypeScript check"
	@echo "  make reset       Drop DB + migrate + seed-all"
	@echo "  make clean       Remove build + node_modules"

install:
	npm install
	npm run prisma:generate

db-up:
	npm run db:up

db-down:
	npm run db:down

migrate:
	npm run prisma:migrate

seed:
	npm run prisma:seed

seed-all:
	npm run prisma:seed
	npm run prisma:seed:mentor
	npm run prisma:seed:teacher
	npm run prisma:seed:admin

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

test:
	npm run test

typecheck:
	npm run typecheck

reset:
	bash scripts/reset-db.sh

clean:
	rm -rf dist node_modules
