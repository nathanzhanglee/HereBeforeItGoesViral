class Building:
    def __init__(self, name, id, capacity = 200, max_employees = 100,type='building', infection_rate = 0.1):
        self.type = type
        self.name = name
        self.capacity = capacity
        self.max_employees = max_employees
        self.size = 0
        self.sus = 0
        self.inf = 0
        self.rec = 0
        self.infection_rate = infection_rate
        self.occupants = []
        self.employees = []
        self.id = id
        self.closed = False
    
    def add_employee(self, person):
        if len(self.employees) == self.max_employees:
            return False
        self.employees.append(person)
        return True

    def add_occupant(self, person):
        if (self.size < self.capacity):
            self.occupants.append(person)
            self.size += 1
            if person.status == 'S':
                self.sus += 1
            elif person.status == 'I':
                self.inf += 1
            else:
                self.rec += 1
            # print(f"{self.type} added {person.status}")
    
    def remove_occupant(self, person):
        self.occupants.remove(person)
        self.size -= 1
        if person.status == 'S':
            self.sus -= 1
        elif person.status == 'I':
            self.inf -= 1
        else:
            self.rec -= 1

    def is_full(self):
        return self.size >= self.capacity

    def update(self):
        for person in self.occupants:
            if person.status == 'S':
                if person.infect(self.infection_rate * self.sus * self.inf / self.size / 24):
                    self.sus -= 1
                    self.inf += 1
            if person.status == 'I':
                person.sick()
                if person.status == 'R':
                    self.inf -= 1
                    self.rec += 1

    def rename(self, new_name):
        self.name = new_name

    def __str__(self):
        return f"Building(name={self.name}, id={self.id}, type={self.type}, size={self.size}, sus={self.sus}, inf={self.inf}, rec={self.rec}, occcupants={len(self.occupants)}, employees={len(self.employees)})"