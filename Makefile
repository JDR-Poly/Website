docker:
	docker build -t jdrpoly-web .

db:
	@export $(grep -v '^#' .env | xargs) > /dev/null && docker compose --project-directory ./dev up -d db

db_clean:
	@docker compose --project-directory ./dev down db
