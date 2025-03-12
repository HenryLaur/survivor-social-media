from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession
from database import ItemModel, survivor_items, ItemType
from models import Trade
from fastapi import HTTPException
from service.survivors.survivor_service import get_survivor_by_id
from service.inventory.inventory_service import get_survivor_inventory

async def _transfer_item(
    from_id: int,
    to_id: int,
    item: ItemModel,
    quantity: int,
    db: AsyncSession
) -> None:
    
    sender_item = await db.execute(
        select(survivor_items.c.quantity)
        .where(
            (survivor_items.c.survivor_id == from_id) & 
            (survivor_items.c.item_id == item.id)
        )
    )
    
    current_qty = sender_item.scalar_one()
    new_qty = current_qty - quantity
    if new_qty < 0:
        raise HTTPException(status_code=400, detail=f"Insufficient quantity of {item.name}")
        
    await db.execute(
        update(survivor_items)
        .where(
            (survivor_items.c.survivor_id == from_id) & 
            (survivor_items.c.item_id == item.id)
        )
        .values(quantity=new_qty)
    )
    
    receiver_item = await db.execute(
        select(survivor_items.c.quantity)
        .where(
            (survivor_items.c.survivor_id == to_id) & 
            (survivor_items.c.item_id == item.id)
        )
    )
    existing_item = receiver_item.first()
    
    if existing_item:
        current_qty = existing_item[0]
        new_qty = current_qty + quantity
        await db.execute(
            update(survivor_items)
            .where(
                (survivor_items.c.survivor_id == to_id) & 
                (survivor_items.c.item_id == item.id)
            )
            .values(quantity=new_qty)
        )
    else:
        await db.execute(
            survivor_items.insert().values(
                survivor_id=to_id,
                item_id=item.id,
                quantity=quantity
            )
        )

async def trade_items(trade: Trade, db: AsyncSession) -> dict:
    try:
        async with db.begin():
            trader1 = await get_survivor_by_id(trade.trader1.survivor_id, db)
            trader2 = await get_survivor_by_id(trade.trader2.survivor_id, db)

            if not trader1 or not trader2:
                raise HTTPException(status_code=404, detail="One or both traders not found")
            
            if trader1.infected or trader2.infected:
                raise HTTPException(status_code=400, detail="Infected survivors cannot trade")

            inventory1 = await get_survivor_inventory(trader1.id, db)
            inventory2 = await get_survivor_inventory(trader2.id, db)
            
            for item_type, qty in trade.trader1.items.dict().items():
                if inventory1[item_type] < qty:
                    raise HTTPException(status_code=400, detail=f"Trader 1 doesn't have enough {item_type}")

            for item_type, qty in trade.trader2.items.dict().items():
                if inventory2[item_type] < qty:
                    raise HTTPException(status_code=400, detail=f"Trader 2 doesn't have enough {item_type}")

            points1 = sum(ItemType[item].points * qty for item, qty in trade.trader1.items.dict().items())
            points2 = sum(ItemType[item].points * qty for item, qty in trade.trader2.items.dict().items())

            if points1 != points2:
                raise HTTPException(status_code=400, detail="Trade points must be equal")

            items_result = await db.execute(select(ItemModel))
            items_db = {item.name: item for item in items_result.scalars().all()}

            for item_type, qty in trade.trader1.items.dict().items():
                if qty > 0:
                    item = items_db[ItemType[item_type]]
                    await _transfer_item(
                        from_id=trade.trader1.survivor_id,
                        to_id=trade.trader2.survivor_id,
                        item=item,
                        quantity=qty,
                        db=db
                    )

            for item_type, qty in trade.trader2.items.dict().items():
                if qty > 0:
                    item = items_db[ItemType[item_type]]
                    await _transfer_item(
                        from_id=trade.trader2.survivor_id,
                        to_id=trade.trader1.survivor_id,
                        item=item,
                        quantity=qty,
                        db=db
                    )

            return {"message": "Trade completed successfully"}
    except Exception as e:
        print(f"Error during trade: {str(e)}")
        raise 