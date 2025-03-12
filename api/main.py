from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Survivor, Location, Trade, ReportInfection, SurvivorCreate
from database import get_db, init_db
from sqlalchemy.ext.asyncio import AsyncSession
from service import (
    create_survivor,
    update_location,
    get_all_survivors,
    get_survivor_by_id,
    get_survivor_by_name,
    report_infection,
    trade_items
)
from sqlalchemy.orm import Session

app = FastAPI(title="ZSSN API", description="Zombie Survival Social Network API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

@app.post("/survivors/", response_model=Survivor)
async def register_survivor(survivor: SurvivorCreate, db: AsyncSession = Depends(get_db)):
    return await create_survivor(survivor, db)

@app.put("/survivors/{survivor_id}/location")
async def update_survivor_location(
    survivor_id: int, location: Location, db: AsyncSession = Depends(get_db)
):
    return await update_location(survivor_id, location, db)

@app.post("/survivors/{survivor_id}/report")
async def report_survivor_infection(
    survivor_id: int, report: ReportInfection, db: AsyncSession = Depends(get_db)
):
    return await report_infection(survivor_id, report, db)

@app.post("/trade")
async def trade(trade: Trade, db: AsyncSession = Depends(get_db)):
    return await trade_items(trade, db)

@app.get("/survivors/", response_model=List[Survivor])
async def list_survivors(db: AsyncSession = Depends(get_db)):
    return await get_all_survivors(db)

@app.get("/survivors/{survivor_id}", response_model=Survivor)
async def get_survivor(survivor_id: int, db: AsyncSession = Depends(get_db)):
    survivor = await get_survivor_by_id(survivor_id, db)
    if not survivor:
        raise HTTPException(status_code=404, detail="Survivor not found")
    return survivor

@app.get("/survivors/by-name/{name}", response_model=Survivor)
async def get_survivor_name(name: str, db: AsyncSession = Depends(get_db)):
    survivor = await get_survivor_by_name(name, db)
    if not survivor:
        raise HTTPException(status_code=404, detail="Survivor not found")
    return survivor 