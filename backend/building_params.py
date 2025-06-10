from building import Building
from building_types.hosptial import *
from building_types.school import *
from building_types.office import *
from building_types.home import *
from building_types.restaurant import *
from building_types.store import *


building_construct = {
    'hospital': {'name': 'Hospital', 'capacity': 500, 'staff': 150, 'type': 'hospital', 'infection_rate': 0.1},
    'school': {'name': 'School', 'capacity': 500, 'staff': 100, 'type': 'school', 'infection_rate': 0.05},
    'office': {'name': 'Office', 'capacity': 150, 'staff': 150, 'type': 'office', 'infection_rate': 0.05},
    'home': {'name': 'Home', 'capacity': 6, 'staff': 0, 'type': 'home', 'infection_rate': 0.2},
    'restaurant': {'name': 'Restaurant', 'capacity': 100, 'staff': 25, 'type': 'restaurant', 'infection_rate': 0.025},
    'store': {'name': 'Store', 'capacity': 200, 'staff': 50, 'type': 'store', 'infection_rate': 0.025},
}

building_update_fn = {
    'hospital': hospital_update_fn,
    'school': school_update_fn,
    'office': office_update_fn,
    'home': home_update_fn,
    'restaurant': restaurant_update_fn,
    'store': store_update_fn,
}