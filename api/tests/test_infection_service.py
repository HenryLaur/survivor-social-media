import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Gender, Inventory, ReportInfection, SurvivorCreate
from api.service.infection.infection_service import report_infection
from api.service.survivors.survivor_service import create_survivor


@pytest.mark.asyncio
async def test_report_infection(db: AsyncSession):
    reporter = await create_survivor(
        SurvivorCreate(
            name="Reporter",
            age=25,
            gender=Gender.male,
            latitude=0.0,
            longitude=0.0,
            inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
        ),
        db
    )

    target = await create_survivor(
        SurvivorCreate(
            name="Target",
            age=25,
            gender=Gender.male,
            latitude=0.0,
            longitude=0.0,
            inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
        ),
        db
    )

    result = await report_infection(
        target.id,
        ReportInfection(reporter_id=reporter.id),
        db
    )

    assert "recorded" in result["message"]
    assert "1" in result["message"]

@pytest.mark.asyncio
async def test_cannot_report_self(db: AsyncSession):
    survivor = await create_survivor(
        SurvivorCreate(
            name="Self Reporter",
            age=25,
            gender=Gender.male,
            latitude=0.0,
            longitude=0.0,
            inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
        ),
        db
    )

    with pytest.raises(HTTPException) as exc_info:
        await report_infection(
            survivor.id,
            ReportInfection(reporter_id=survivor.id),
            db
        )
    assert exc_info.value.status_code == 400

@pytest.mark.asyncio
async def test_cannot_report_twice(db: AsyncSession):
    reporter = await create_survivor(
        SurvivorCreate(
            name="Double Reporter",
            age=25,
            gender=Gender.male,
            latitude=0.0,
            longitude=0.0,
            inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
        ),
        db
    )

    target = await create_survivor(
        SurvivorCreate(
            name="Double Target",
            age=25,
            gender=Gender.male,
            latitude=0.0,
            longitude=0.0,
            inventory=Inventory(water=1, food=1, medication=1, ammunition=1)
        ),
        db
    )

    await report_infection(
        target.id,
        ReportInfection(reporter_id=reporter.id),
        db
    )

    with pytest.raises(HTTPException) as exc_info:
        await report_infection(
            target.id,
            ReportInfection(reporter_id=reporter.id),
            db
        )
    assert exc_info.value.status_code == 400
    assert "already reported" in exc_info.value.detail
