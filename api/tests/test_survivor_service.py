import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Gender, Inventory, Location, SurvivorCreate
from api.service.survivors.survivor_service import (
    create_survivor,
    get_survivor_by_id,
    get_survivor_by_name,
    update_location,
)


@pytest.mark.asyncio
async def test_create_survivor(db: AsyncSession):
    survivor_data = SurvivorCreate(
        name="Test Survivor",
        age=25,
        gender=Gender.male,
        latitude=0.0,
        longitude=0.0,
        inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
    )

    created_survivor = await create_survivor(survivor_data, db)

    assert created_survivor.name == survivor_data.name
    assert created_survivor.age == survivor_data.age
    assert created_survivor.gender == survivor_data.gender
    assert created_survivor.latitude == survivor_data.latitude
    assert created_survivor.longitude == survivor_data.longitude
    assert not created_survivor.infected
    assert len(created_survivor.reporters) == 0
    assert created_survivor.inventory.water == survivor_data.inventory.water

@pytest.mark.asyncio
async def test_create_duplicate_survivor(db: AsyncSession):
    survivor_data = SurvivorCreate(
        name="Duplicate Survivor",
        age=25,
        gender=Gender.male,
        latitude=0.0,
        longitude=0.0,
        inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
    )
    await create_survivor(survivor_data, db)

    with pytest.raises(HTTPException) as exc_info:
        await create_survivor(survivor_data, db)
    assert exc_info.value.status_code == 400
    assert "already exists" in exc_info.value.detail

@pytest.mark.asyncio
async def test_update_location(db: AsyncSession):
    survivor_data = SurvivorCreate(
        name="Location Test",
        age=25,
        gender=Gender.male,
        latitude=0.0,
        longitude=0.0,
        inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
    )
    created = await create_survivor(survivor_data, db)
    new_location = Location(latitude=1.0, longitude=1.0)

    await update_location(created.id, new_location, db)
    updated = await get_survivor_by_id(created.id, db)

    assert updated is not None
    assert updated.latitude == new_location.latitude
    assert updated.longitude == new_location.longitude

@pytest.mark.asyncio
async def test_get_survivor_by_name_case_insensitive(db: AsyncSession):
    survivor_data = SurvivorCreate(
        name="Case Test",
        age=25,
        gender=Gender.male,
        latitude=0.0,
        longitude=0.0,
        inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
    )
    await create_survivor(survivor_data, db)

    found = await get_survivor_by_name("CASE TEST", db)

    assert found is not None
    assert found.name == survivor_data.name
