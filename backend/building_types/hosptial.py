import random

def hospital_update_fn(building, time, city):
    if building.closed and (time == 6 or time == 20):
        i = 0
        while i < building.size:
            person = building.occupants[i]
            if person.employer == building:
                building.remove_occupant(person)
                city.get_home().add_occupant(person)
                i -= 1
            elif person.status == 'R':
                building.remove_occupant(person)
                person.home.add_occupant(person)
                i -= 1
            i += 1