import enum
from typing import AsyncGenerator

from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from models import Gender

DATABASE_URL = "sqlite+aiosqlite:///./zssn.db"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

infection_reports = Table(
    "infection_reports",
    Base.metadata,
    Column("reporter_id", Integer, ForeignKey("survivors.id"), primary_key=True),
    Column("reported_id", Integer, ForeignKey("survivors.id"), primary_key=True),
)


class ItemType(str, enum.Enum):
    water = "water"
    food = "food"
    medication = "medication"
    ammunition = "ammunition"

    @property
    def points(self) -> int:
        points_map = {"water": 4, "food": 3, "medication": 2, "ammunition": 1}
        return points_map[self.value]


survivor_items = Table(
    "survivor_items",
    Base.metadata,
    Column("survivor_id", Integer, ForeignKey("survivors.id"), primary_key=True),
    Column("item_id", Integer, ForeignKey("items.id"), primary_key=True),
    Column("quantity", Integer, nullable=False, default=0),
)


class ItemModel(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(ItemType), unique=True)
    points = Column(Integer, nullable=False)
    survivors = relationship(
        "SurvivorModel", secondary=survivor_items, back_populates="items"
    )


class SurvivorModel(Base):
    __tablename__ = "survivors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer)
    gender = Column(Enum(Gender))
    latitude = Column(Float)
    longitude = Column(Float)
    infected = Column(Boolean, default=False)
    items = relationship(
        "ItemModel", secondary=survivor_items, back_populates="survivors"
    )
    reporters = relationship(
        "SurvivorModel",
        secondary=infection_reports,
        primaryjoin=(id == infection_reports.c.reported_id),
        secondaryjoin=(id == infection_reports.c.reporter_id),
        backref="reported_survivors",
    )


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        async with AsyncSessionLocal() as session:
            items = [
                ItemModel(name=ItemType.water, points=4),
                ItemModel(name=ItemType.food, points=3),
                ItemModel(name=ItemType.medication, points=2),
                ItemModel(name=ItemType.ammunition, points=1),
            ]
            for item in items:
                existing_item = await session.execute(
                    select(ItemModel).where(ItemModel.name == item.name)
                )
                if not existing_item.scalar_one_or_none():
                    session.add(item)
            await session.commit()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
