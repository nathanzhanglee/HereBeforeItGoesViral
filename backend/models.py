from pydantic import BaseModel
from typing import List, Dict

# Define a Pydantic model for incoming building data
class Building(BaseModel):
    name: str
    building_id: str

class BuildingCounts(BaseModel):
    building_id: str
    S: int
    I: int
    R: int

class Protocol(BaseModel):
    protocol: str