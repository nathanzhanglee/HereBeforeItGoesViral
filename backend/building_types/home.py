import random

def home_update_fn(building, time, city):
    if not city.lockdown and (time == 9 or (time >= 17 and time <= 22)):
        i = 0
        while i < building.size:
            person = building.occupants[i]
            if city.hospitalize and person.infected_time >= 7.0:
                building.remove_occupant(person)
                city.get_hospital().add_occupant(person)
                i -= 1
            elif time == 9:
                if person.occupation == 'student' and not city.schools_closed:
                    building.remove_occupant(person)
                    person.employer.add_occupant(person)
                    i -= 1
                elif person.occupation == 'employed' and not city.workplaces_closed:
                    building.remove_occupant(person)
                    person.employer.add_occupant(person)
                    i -= 1
            else:
                if random.random() < 0.2:
                    building.remove_occupant(person)
                    city.get_leisure().add_occupant(person)
                    i -= 1
            i += 1