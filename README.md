# Zombie Survival Social Network (ZSSN)

A post-apocalyptic social network for survivors to trade resources and report infections.

## Features

- Register and manage survivors
- Track survivor locations
- Report infected survivors
- Trade resources with other survivors
- View survivor statistics

## Tech Stack

### Frontend
- React with TypeScript
- TailwindCSS for styling

### Backend
- FastAPI (Python)
- SQLAlchemy for database management
- Async database operations
- SQLite database (can be easily switched to PostgreSQL)

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. Start the application using Docker Compose
```bash
docker compose -f docker-compose.yml up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Endpoints

### Survivors

#### Register a Survivor
```http
POST /api/survivors
```
Request body:
```json
{
  "name": "string",
  "age": 0,
  "gender": "male | female | other",
  "latitude": 0.0,
  "longitude": 0.0,
  "inventory": {
    "water": 0,
    "food": 0,
    "medication": 0,
    "ammunition": 0
  }
}
```

#### Update Survivor Location
```http
PUT /api/survivors/{survivor_id}/location
```
Request body:
```json
{
  "latitude": 0.0,
  "longitude": 0.0
}
```

### Infections

#### Report an Infection
```http
POST /api/infections/{survivor_id}/report
```
Request body:
```json
{
  "reporter_id": 0,
}
```

### Trading

#### Trade Items
```http
POST /api/trade
```
Request body:
```json
{
  "trader1": {
    "survivor_id": 0,
    "items": {
      "water": 0,
      "food": 0,
      "medication": 0,
      "ammunition": 0
    }
  },
  "trader2": {
    "survivor_id": 0,
    "items": {
      "water": 0,
      "food": 0,
      "medication": 0,
      "ammunition": 0
    }
  }
}
```

## Resource Points System

Each resource has a point value:
- Water: 4 points
- Food: 3 points
- Medication: 2 points
- Ammunition: 1 point

Trading rules:
- Both parties must have the items they're offering
- The total points of items traded must be equal
- Infected survivors cannot trade

## Frontend Features

The frontend provides a user-friendly interface for:
- Registering new survivors
- Managing inventory and trading resources
- Reporting infected survivors
- Viewing survivor statistics

### Key Components
- Inventory management interface
- Trading system with point calculation
- Infection reporting system
- Responsive design for mobile and desktop

## Development

### Running Tests
```bash
# Backend tests
cd api
python -m pytest
```

### Running Linter
```bash
# Run Ruff linter on Python backend
cd api
ruff check .

# Auto-fix Ruff violations where possible
ruff check --fix .
```

```bash
# Run Ruff linter on Python backend
cd frontend
npm run format
```

### API Documentation
Full API documentation is available at http://localhost:8000/docs when the server is running.

## Notes

- A survivor is marked as infected after being reported by 3 different survivors
- Infected survivors cannot trade or access their inventory
- All trades must have equal point values on both sides
- Location updates are allowed for non-infected survivors only 