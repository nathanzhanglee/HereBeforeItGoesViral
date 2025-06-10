import matplotlib.pyplot as plt
from city import *

def run_test_sim(city):
    city.construct_building('office', id=0)
    for i in range(100):
        city.add_home(id=i)

    susceptible_counts = []
    infected_counts = []
    recovered_counts = []

    city.inject_patient_zero()

    for i in range(100):
        for i in range(24):
            city.update_city()
            counts = city.get_counts()
            susceptible_counts.append(counts['susceptible'])
            infected_counts.append(counts['infected'])
            recovered_counts.append(counts['recovered'])


    # for types in city.city.keys():
    #     for building in city.city[types]:
    #         print(building.__str__())

    plt.plot(susceptible_counts, label='Susceptible')
    plt.plot(infected_counts, label='Infected')
    plt.plot(recovered_counts, label='Recovered')
    plt.xlabel('Time (updates)')
    plt.ylabel('Number of People')
    plt.title('Pandemic Simulation in Building')
    plt.legend()
    plt.show()
