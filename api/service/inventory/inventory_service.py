from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import ItemModel, ItemType, survivor_items


async def get_survivor_inventory(survivor_id: int, db: AsyncSession) -> dict:
    result = await db.execute(
        select(ItemModel.name, survivor_items.c.quantity)
        .join(survivor_items, ItemModel.id == survivor_items.c.item_id)
        .where(survivor_items.c.survivor_id == survivor_id)
    )

    inventory = {
        ItemType.water.value: 0,
        ItemType.food.value: 0,
        ItemType.medication.value: 0,
        ItemType.ammunition.value: 0,
    }

    for row in result:
        inventory[row.name.value] = row.quantity

    return inventory


async def add_inventory_items(survivor_id: int, items: dict, db: AsyncSession) -> None:
    items_result = await db.execute(select(ItemModel))
    items_db = {item.name: item for item in items_result.scalars().all()}

    for item_type, quantity in items.items():
        if quantity > 0:
            item = items_db[ItemType[item_type]]
            await db.execute(
                survivor_items.insert().values(
                    survivor_id=survivor_id, item_id=item.id, quantity=quantity
                )
            )
