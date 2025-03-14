import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import AsyncSessionLocal, Base, ItemModel, ItemType, engine


@pytest_asyncio.fixture
async def db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        await session.execute(text('DROP TABLE IF EXISTS infection_reports'))
        await session.execute(text('DROP TABLE IF EXISTS survivor_items'))
        await session.execute(text('DROP TABLE IF EXISTS survivors'))
        await session.execute(text('DROP TABLE IF EXISTS items'))
        await session.commit()

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        items = [
            ItemModel(name=ItemType.water.value, points=4),
            ItemModel(name=ItemType.food.value, points=3),
            ItemModel(name=ItemType.medication.value, points=2),
            ItemModel(name=ItemType.ammunition.value, points=1),
        ]
        session.add_all(items)
        await session.commit()

        yield session

        await session.rollback()
        await session.close()
