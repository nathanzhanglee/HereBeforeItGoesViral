def school_update_fn(building, time, city):
    if not building.closed and (time == 15 or time == 17):
        i = 0
        while i < building.size:
            person = building.occupants[i]
            if time == 15 and person.occupation == 'student':
                building.remove_occupant(person)
                person.home.add_occupant(person)
                i -= 1
            else:
                building.remove_occupant(person)
                person.home.add_occupant(person)
                i -= 1
            i += 1