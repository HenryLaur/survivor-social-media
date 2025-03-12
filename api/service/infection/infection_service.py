from fastapi import HTTPException
from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import SurvivorModel, infection_reports
from models import ReportInfection
from service.survivors.survivor_service import get_survivor_by_id


async def report_infection(
    survivor_id: int, report: ReportInfection, db: AsyncSession
) -> dict:
    survivor = await get_survivor_by_id(survivor_id, db)
    if not survivor:
        raise HTTPException(status_code=404, detail="Survivor not found")

    if survivor.infected:
        raise HTTPException(status_code=400, detail="Survivor is already infected")

    reporter = await get_survivor_by_id(report.reporter_id, db)
    if not reporter:
        raise HTTPException(status_code=404, detail="Reporter not found")
    if reporter.infected:
        raise HTTPException(
            status_code=400, detail="Infected survivors cannot report others"
        )

    existing_report = await db.execute(
        select(infection_reports).where(
            and_(
                infection_reports.c.reporter_id == report.reporter_id,
                infection_reports.c.reported_id == survivor_id,
            )
        )
    )
    if existing_report.first():
        raise HTTPException(
            status_code=400, detail="You have already reported this survivor"
        )

    try:
        await db.execute(
            infection_reports.insert().values(
                reporter_id=report.reporter_id, reported_id=survivor_id
            )
        )
        await db.commit()

        report_count = await db.execute(
            select(func.count())
            .select_from(infection_reports)
            .where(infection_reports.c.reported_id == survivor_id)
        )
        total_reports = report_count.scalar()

        if total_reports >= 3:
            await db.execute(
                update(SurvivorModel)
                .where(SurvivorModel.id == survivor_id)
                .values(infected=True)
            )
            await db.commit()  # Commit the infected status update
            return {"message": "Survivor has been marked as infected"}

        return {"message": f"Infection report recorded. Total reports: {total_reports}"}

    except Exception as e:
        await db.rollback()  # Rollback on error
        raise HTTPException(
            status_code=500,
            detail=f"Failed to report infection: {str(e)}"
        ) from e
