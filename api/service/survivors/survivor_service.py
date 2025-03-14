from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.database import SurvivorModel
from api.models import Inventory, Location, Survivor, SurvivorCreate
from api.service.inventory.inventory_service import (
    add_inventory_items,
    get_survivor_inventory,
)


async def create_survivor(survivor: SurvivorCreate, db: AsyncSession) -> Survivor:
    existing_survivor = await get_survivor_by_name(survivor.name, db)
    if existing_survivor:
        raise HTTPException(
            status_code=400, detail="A survivor with this name already exists"
        )

    try:
        db_survivor = SurvivorModel(
            name=survivor.name,
            age=survivor.age,
            gender=survivor.gender,
            latitude=survivor.latitude,
            longitude=survivor.longitude,
        )

        db.add(db_survivor)
        await db.flush()

        await add_inventory_items(db_survivor.id, survivor.inventory.model_dump(), db)
        await db.commit()

        return Survivor(
            id=db_survivor.id,
            name=db_survivor.name,
            age=db_survivor.age,
            gender=db_survivor.gender,
            latitude=db_survivor.latitude,
            longitude=db_survivor.longitude,
            infected=db_survivor.infected,
            reporters=[],
            inventory=survivor.inventory,
        )
    except Exception as e:
        await db.rollback()
        print(f"Error creating survivor: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create survivor"
        ) from e


async def update_location(
    survivor_id: int, location: Location, db: AsyncSession
) -> dict:
    result = await db.execute(
        update(SurvivorModel)
        .where(SurvivorModel.id == survivor_id)
        .values(latitude=location.latitude, longitude=location.longitude)
    )

    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Survivor not found")
    return {"message": "Location updated successfully"}


async def get_all_survivors(db: AsyncSession) -> List[Survivor]:
    result = await db.execute(
        select(SurvivorModel).options(selectinload(SurvivorModel.reporters))
    )
    db_survivors = result.scalars().all()

    survivors = []

    for db_survivor in db_survivors:
        inventory = await get_survivor_inventory(db_survivor.id, db)
        survivors.append(
            Survivor(
                id=db_survivor.id,
                name=db_survivor.name,
                age=db_survivor.age,
                gender=db_survivor.gender,
                latitude=db_survivor.latitude,
                longitude=db_survivor.longitude,
                infected=db_survivor.infected,
                reporters=[reporter.id for reporter in db_survivor.reporters],
                inventory=Inventory(**inventory),
            )
        )
    return survivors


async def get_survivor_by_id(survivor_id: int, db: AsyncSession) -> Optional[Survivor]:
    result = await db.execute(
        select(SurvivorModel)
        .options(selectinload(SurvivorModel.reporters))
        .where(SurvivorModel.id == survivor_id)
    )
    db_survivor = result.scalar_one_or_none()

    if db_survivor is None:
        return None

    inventory = await get_survivor_inventory(db_survivor.id, db)
    return Survivor(
        id=db_survivor.id,
        name=db_survivor.name,
        age=db_survivor.age,
        gender=db_survivor.gender,
        latitude=db_survivor.latitude,
        longitude=db_survivor.longitude,
        infected=db_survivor.infected,
        reporters=[reporter.id for reporter in db_survivor.reporters],
        inventory=Inventory(**inventory),
    )


async def get_survivor_by_name(name: str, db: AsyncSession) -> Optional[Survivor]:
    result = await db.execute(
        select(SurvivorModel)
        .options(selectinload(SurvivorModel.reporters))
        .where(func.lower(SurvivorModel.name) == func.lower(name))
    )
    db_survivor = result.scalar_one_or_none()

    if db_survivor is None:
        return None

    inventory = await get_survivor_inventory(db_survivor.id, db)
    return Survivor(
        id=db_survivor.id,
        name=db_survivor.name,
        age=db_survivor.age,
        gender=db_survivor.gender,
        latitude=db_survivor.latitude,
        longitude=db_survivor.longitude,
        infected=db_survivor.infected,
        reporters=[reporter.id for reporter in db_survivor.reporters],
        inventory=Inventory(**inventory),
    )
