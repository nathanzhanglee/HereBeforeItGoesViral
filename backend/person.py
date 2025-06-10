import random

class Person:
    def __init__(self, name, age, occupation, init_status = 'S'):
        self.name = name
        self.age = age
        self.status = init_status
        self.infected_time = 0.0
        self.occupation = occupation
        self.employer = None
        self.home = None

    def set_employment(self, city):
        if self.occupation == 'employed':
            self.employer = city.get_workplace(self)
        elif self.occupation == 'student':
            self.employer = city.get_learning_institution(self)
        # print(f"{self.name} is employed at {self.employer.name}")

    def infect(self, rate):
        if random.random() < rate:
            self.status = 'I'
            return True
        return False
    
    def sick(self):
        self.infected_time += (1.0/24.0)
        if (self.infected_time >= 14.0):
            self.infected_time = 0.0
            self.status = 'R'

    def __str__(self):
        return f"Person(name={self.name}, age={self.age}, health_status={self.status}, occupation={self.occupation})"