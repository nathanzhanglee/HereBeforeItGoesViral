from fastapi import APIRouter, HTTPException
from typing import List, Dict
from models import *
from city import City
from tempsim import run_test_sim

router = APIRouter()
city = City()

# Endpoint to receive building data and run the simulation
@router.post("/run-simulation", response_model=str)
async def run_simulation(building_types: Dict[str, List[Building]]):
    city.reset()
    if not building_types:
        raise HTTPException(status_code=400, detail="No building data provided")
    for building_type, buildings in building_types.items():
        if building_type == 'home':
            for building in buildings:
                city.add_apartment(building.building_id, 50)
        else:
            for building in buildings:
                city.construct_building(building_type, building.building_id)
    # Return the simulation results
    # run_test_sim(city)
    for i in range(8):
        city.inject_patient_zero()
    return "hello"

@router.post("/activate", response_model=str)
async def activate(protocol: Protocol):
    activate = protocol.protocol
    boolean = False
    if activate == 'mask':
        boolean = city.update_mask_mandate()
    elif activate == 'school':
        boolean = city.update_schools()
    elif activate == 'work':
        boolean = city.update_workplaces()
    elif activate == 'lockdown':
        boolean = city.update_lockdown()
    elif activate == 'hospital':
        boolean = city.update_hospitalize()
    return str(boolean)

@router.post("/tick", response_model=List[BuildingCounts])
async def tick():
    city.update_city()
    return city.get_building_counts()