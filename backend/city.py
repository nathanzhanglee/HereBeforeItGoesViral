from building_params import *
from people_params import *
from building import Building
import random
from datetime import datetime, timedelta

workplaces = ['restaurant', 'office', 'store', 'hospital', 'school']
leisures = ['restaurant', 'store']

class City: 
    def __init__(self):
        self.clock = datetime(2025, 1, 1, 6, 0, 0)
        self.city = {
            'restaurant': [],
            'hospital': [],
            'school': [],
            'office': [],
            'home': [],
            'store': [],
        }
        self.mandate = False
        self.lockdown = False
        self.schools_closed = False
        self.workplaces_closed = False
        self.hospitalize = False
    
    def reset(self):
        self.clock = datetime(2025, 1, 1, 6, 0, 0)
        self.city = {
            'restaurant': [],
            'hospital': [],
            'school': [],
            'office': [],
            'home': [],
            'store': [],
        }
        self.mandate = False
        self.lockdown = False
        self.schools_closed = False
        self.workplaces_closed = False
        self.hospitalize = False

    def update_city(self):
        self.clock += timedelta(hours=1)
        for types in self.city.keys():
            for building in self.city[types]:
                building.update()
                building_update_fn[types](building, self.clock.hour, self)

    def get_total_buildings(self):
        return sum([len(buildings) for buildings in self.city.values()])

    def get_counts(self):
        counts = {
            'susceptible': 0,
            'infected': 0,
            'recovered': 0
        }
        for buildings in self.city.values():
            for building in buildings:
                counts['susceptible'] += building.sus
                counts['infected'] += building.inf
                counts['recovered'] += building.rec
        return counts

    def get_building_counts(self):
        counts = []
        for buildings in self.city.values():
            for building in buildings:
                counts.append({'building_id': building.id, 'S': building.sus, 'I': building.inf, 'R': building.rec})
        return counts

    def get_workplace(self, person):
        workplace = random.choice(self.city[random.choice(workplaces)])
        while not workplace.add_employee(person):
            workplace = random.choice(self.city[random.choice(workplaces)])
        return workplace

    def get_learning_institution(self, person):
        school = random.choice(self.city['school'])
        while not school.add_employee(person):
            school = random.choice(self.city['school'])
        return school

    def get_leisure(self):
        leisure = random.choice(self.city[random.choice(leisures)])
        while leisure.is_full():
            leisure = random.choice(self.city[random.choice(leisures)])
        return leisure

    def construct_building(self, building_type, id):
        building_params = building_construct[building_type]
        self.city[building_type].append(Building(building_params['name'], id, capacity=building_params['capacity'], max_employees=building_params['staff'], type=building_params['type'], infection_rate=building_params['infection_rate']))

    def construct_hospital(self, id, numBeds, numWorkers):
        building_params = building_construct['hospital']
        self.city['hospital'].append(Building(building_params['name'], id, capacity=numBeds, max_employees=numWorkers, type=building_params['type'], infection_rate=building_params['infection_rate']))

    def construct_person(self, person_type):
        person_params = person_construct[person_type]
        return Person(person_params['name'], person_params['age'], person_params['occupation'])

    def add_home(self, id, name="", adults = 2, children = 2):
        home_params = building_construct['home']
        home = Building(name, id, capacity=home_params['capacity'], max_employees=home_params['staff'], type=home_params['type'], infection_rate=home_params['infection_rate'])
        for i in range(adults):
            person = self.construct_person('worker')
            person.home = home
            person.set_employment(self)
            home.add_occupant(person)
        for i in range(children):
            person = self.construct_person('child')
            person.home = home
            person.set_employment(self)
            home.add_occupant(person)
        self.city['home'].append(home)
    
    def add_apartment(self, id, num_units = 50):
        for i in range(num_units):
            self.add_home(id + str(i), id, random.randint(1, 4), random.randint(0, 1))

    def inject_patient_zero(self):
        patients_home = random.choice(self.city['home'])
        patients_home.sus -= 1
        patients_home.inf += 1
        patients_home.occupants[0].status = 'I'

    def update_mask_mandate(self):     
        self.mandate = not self.mandate
        for buildings in self.city.values():
            for building in buildings:
                if building.type != 'home':
                    if self.mandate:
                        building.infection_rate = building.infection_rate * 0.1
                    else: 
                        building.infection_rate = building.infection_rate / 0.1
        return self.mandate

    def update_schools(self):
        self.schools_closed = not self.schools_closed
        return self.schools_closed

    def update_workplaces(self):
        self.workplaces_closed = not self.workplaces_closed
        return self.workplaces_closed

    def update_lockdown(self):
        self.lockdown = not self.lockdown
        return self.lockdown
    
    def update_hospitalize(self):
        self.hospitalize = not self.hospitalize
        return self.hospitalize