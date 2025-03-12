from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, init_db
from models import Location, ReportInfection, Survivor, SurvivorCreate, Trade
from service import (
    create_survivor,
    get_all_survivors,
    get_survivor_by_id,
    get_survivor_by_name,
    report_infection,
    trade_items,
    update_location,
)

app = FastAPI(title="ZSSN API", description="Zombie Survival Social Network API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Module-level singleton for database dependency
db_dependency = Depends(get_db)

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Zombie Survival Social Network API"}

@app.post("/survivors", response_model=Survivor)
async def endpoint_create_survivor(
    survivor: SurvivorCreate,
    db: AsyncSession = db_dependency
):
    return await create_survivor(survivor, db)

@app.put("/survivors/{survivor_id}/location", response_model=Survivor)
async def endpoint_update_location(
    survivor_id: int,
    location: Location,
    db: AsyncSession = db_dependency
):
    return await update_location(survivor_id, location, db)

@app.post("/survivors/{survivor_id}/report")
async def endpoint_report_infection(
    survivor_id: int,
    report: ReportInfection,
    db: AsyncSession = db_dependency
):
    return await report_infection(survivor_id, report, db)

@app.post("/trade")
async def endpoint_trade(
    trade: Trade,
    db: AsyncSession = db_dependency
):
    return await trade_items(trade, db)

@app.get("/survivors", response_model=list[Survivor])
async def endpoint_list_survivors(
    db: AsyncSession = db_dependency
):
    return await get_all_survivors(db)

@app.get("/survivors/{survivor_id}", response_model=Survivor)
async def endpoint_get_survivor(
    survivor_id: int,
    db: AsyncSession = db_dependency
):
    survivor = await get_survivor_by_id(survivor_id, db)
    if not survivor:
        raise HTTPException(status_code=404, detail="Survivor not found")
    return survivor

@app.get("/survivors/name/{name}", response_model=list[Survivor])
async def endpoint_get_survivor_name(
    name: str,
    db: AsyncSession = db_dependency
):
    survivor = await get_survivor_by_name(name, db)
    if not survivor:
        raise HTTPException(status_code=404, detail="Survivor not found")
    return survivor
