from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class Inventory(BaseModel):
    water: int = Field(default=0, ge=0)
    food: int = Field(default=0, ge=0)
    medication: int = Field(default=0, ge=0)
    ammunition: int = Field(default=0, ge=0)

class SurvivorCreate(BaseModel):
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=0)
    gender: Gender
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    inventory: Inventory

class Survivor(BaseModel):
    id: int
    name: str
    age: int
    gender: Gender
    latitude: float
    longitude: float
    infected: bool = False
    inventory: Inventory
    reporters: List[int] = []

class ReportInfection(BaseModel):
    reporter_id: int

class TradeItem(BaseModel):
    survivor_id: int
    items: Inventory

class Trade(BaseModel):
    trader1: TradeItem
    trader2: TradeItem
