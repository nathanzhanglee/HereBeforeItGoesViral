let map;
let buildings = {
    "hospital": [],
    "restaurant": [],
    "school": [],
    "office": [],
    "store": [],
    "home": []
};
let hospitalMarkers = new Map(); // Store unique hospitals by place_id
let bounds = null;
let tickInterval = null;
let allCircles = [];
let tickCounter = 0;

async function initMap() {
    const center = { lat: 39.952305, lng: -75.193703 }; // Philadelphia

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: center,
        mapId: "e442d3b4191ab219",
        disableDefaultUI: false, // Set to true to remove all controls
        zoomControl: false,      // Remove zoom buttons (+, -)
        fullscreenControl: false, // Remove fullscreen button
        streetViewControl: false, // Remove Pegman (Street View control)
        mapTypeControl: false,
    });
    drawBoundingBox();
    google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
        map.setZoom(14.85);  // Adjust zoom here after bounds are set
    });

    initializeSIRGraph();
    findNearby();
}

const indexedPlaces = new Map();

function findNearby() {
    indexedPlaces.clear();
    const service = new google.maps.places.PlacesService(map);
    const types = ['hospital', 'restaurant', 'school', 'office', 'store', 'home'];
    types.forEach(type => {
        const request = {
            bounds: bounds,
            type: type 
        };
        if (type === 'home') {
            request.keyword = 'apartment complex';
        }
        getAllPlaces(service, request, type, buildings[type]);
    });
    console.log("All buildings:", buildings);
}

function getAllPlaces(service, request, type, resultsArray = []) {
    service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                if (!place.types.includes('doctor') && !indexedPlaces.has(place.place_id)) {  // Exclude unwanted types
                    indexedPlaces.set(place.place_id, {lng : place.geometry.location.lng(), lat : place.geometry.location.lat()});
                    resultsArray.push({
                        name: place.name,
                        building_id: place.place_id,
                    });
                }
            });
            // If there are more pages, fetch the next page recursively
            if (pagination && pagination.hasNextPage) {
                setTimeout(() => {
                    pagination.nextPage();
                }, 2000);  // Delay to avoid hitting API limits
            } else {
                if (type == 'school') {
                    buildings[type] = buildings[type].slice(0, 10);  // Limit schools to 10
                }
                if (type == 'home') {
                    buildings[type] = buildings[type].slice(0, 10);  // Limit apartments to 10
                }
                // console.log(`All ${type}s found within the box:`, resultsArray);
            }
        } else {
            console.error(`Error fetching places for ${type}:`, status);
        }
    });
}

let daysElapsed = 0;
let dayTimerInterval;

function startSimulation() {
    if (Object.keys(buildings).length === 0) {
        alert("No building data available!");
        return;
    }

    // Get elements
    const controls = document.getElementById("controls");
    const chartContainer = document.getElementById("sirGraphContainer");
    const timerDisplay = document.getElementById("timer");
    const stopButton = document.getElementById("stopbtn");
    const stats = document.getElementById("statisticsBox");


    // Collapse controls and show necessary elements
    if (!controls.classList.contains("collapsed")) {
        controls.classList.add("collapsed");
        chartContainer.style.display = "block";  // Show chart when collapsed
        timerDisplay.style.display = "block";  // Show timer
        stopButton.style.display = "block";  // Show stop button
        stats.style.display = "block"
        document.getElementById("toggleControls").textContent = "+";
    }

    // Reset and start timer
    daysElapsed = 0;
    updateDayTimerDisplay();
    clearInterval(dayTimerInterval);
    dayTimerInterval = setInterval(updateDayTimer, 2000);

    fetch(`${BACKEND_URL}/run-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildings)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Simulation result:", data);
    })
    .catch(error => console.error("Error running simulation:", error));
    
    tickInterval = setInterval(tick, 100);
}
function stopTick() {
    clearInterval(tickInterval);
    
}

function tick() {
    fetch(`${BACKEND_URL}/tick`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log("Simulation result:", data);
        updateSIRGraph(data);
        
        tickCounter++;
        
        if (tickCounter % 4 === 0) {
            clearCircles();
            updateDotsGraph(data);
        }

    })
    .catch(error => console.error("Error running simulation:", error));
}

let simulationPaused = false;

function stopSimulation() {
    const stopButton = document.getElementById("stopbtn");

    if (!simulationPaused) {
        // Pause the simulation
        clearInterval(tickInterval);
        clearInterval(dayTimerInterval);
        stopButton.textContent = "Resume Simulation";
        simulationPaused = true;
        if (!controls.classList.contains("collapsed")) {
            controls.classList.add("collapsed");
            toggleControls.textContent = "+";
        }

    } else {
        // Resume the simulation
        tickInterval = setInterval(tick, 100);
        dayTimerInterval = setInterval(updateDayTimer, 2000);
        stopButton.textContent = "Stop Simulation";
        simulationPaused = false;
        if (controls.classList.contains("collapsed")) {
            toggleControls.textContent = "+";
        }
    }
}

function initializeSIRGraph() {
    const ctx = document.getElementById('sirGraph').getContext('2d');
    window.sirGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Susceptible',
                    data: [],
                    borderColor:'rgb(255, 200, 0)', // Softer yellow
                    backgroundColor: 'rgb(255, 200,0)',
                    borderWidth: 2,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: 'Infected',
                    data: [],
                    borderColor: 'rgba(220, 6, 6, 0.92)' , // Softer red
                    backgroundColor:'rgba(220, 6, 6, 0.92)' ,
                    borderWidth: 2,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: 'Recovered',
                    data: [],
                    borderColor: 'rgb(4, 4, 208)', // Softer blue
                    backgroundColor: 'rgb(4, 4, 208)',
                    borderWidth: 2,
                    pointRadius: 3,
                    fill: false
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        font: {
                            size: 14,
                            family: 'Arial',
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (hours)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        display: false // Hide vertical grid lines for a cleaner look
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'People',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)' // Softer grid color
                    },
                    ticks: {
                        stepSize: 500, // Adjust step size for readability
                        font: { size: 12 }
                    }
                }
            },
            animation: {
                duration: 1000,          
            }
    }
});
}

let time = 0;

function updateSIRGraph(data) {
    let S = 0, I = 0, R = 0;
    time++;
    data.forEach(building => {
        S += building["S"];
        I += building["I"];
        R += building["R"];
    });
    console.log("S:", S, "I:", I, "R:", R);

    if (window.sirGraph) {
        window.sirGraph.data.labels.push(time);
        window.sirGraph.data.datasets[0].data.push(S);
        window.sirGraph.data.datasets[1].data.push(I);
        window.sirGraph.data.datasets[2].data.push(R);
        window.sirGraph.update();
    }

    document.getElementById("susceptibleCount").textContent = S;
    document.getElementById("infectedCount").textContent = I;
    document.getElementById("recoveredCount").textContent = R;
}

function clearCircles() {
    // Loop through and remove each circle from the map
    allCircles.forEach(circle => circle.setMap(null));
    // Clear the array
    allCircles = [];
}

function updateDotsGraph(data) {

    clearCircles(); // toggle as comment or not
    
    data.forEach(building => {
        let location = null;
        if (indexedPlaces.has(building["building_id"])) {
            console.log("building is indexed");
            location = indexedPlaces.get(building["building_id"]);
        }
        else {
            console.log("building not indexed!");
        }
        drawCircles(building["S"], building["I"], building["R"], location);
        drawStayAtHomers(building["S"]/20, building["I"]/20, building["R"]/20, bounds);
    });
}


// Stop timer when needed (e.g., simulation ends)
function stopTimer() {
    clearInterval(timerInterval);
}

function updateDayTimer() {
    daysElapsed++;
    updateDayTimerDisplay();
}

function updateDayTimerDisplay() {
    document.getElementById("timer").textContent = `Day ${daysElapsed}`;
}

function stopTimer() {
    clearInterval(dayTimerInterval);
}

function findHospitals() {
    const bounds = map.getBounds();
    if (!bounds) return;
    const service = new google.maps.places.PlacesService(map);
    const request = {
        bounds: bounds,
        type: "hospital",
        keyword: "hospital"
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach((place) => {
                if (isValidHospital(place) && !hospitalMarkers.has(place.place_id)) {
                    hospitalMarkers.set(place.place_id, place.geometry.location);
                    addHospitalMarker(place.geometry.location, place.name);
                }
            });
        }
    });
}

// Function to verify that the result is actually a hospital
function isValidHospital(place) { 
    const validTypes = ["hospital", "health"];
    return place.name.toLowerCase().includes("hospital") && place.types.some(type => validTypes.includes(type));
}

function updateLocation() {
    const address = document.getElementById("locationInput").value;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(15);
            searchNearbyPlaces(location);
        } else {
            alert("Location not found: " + status);
        }
    });
}
let currentRectangle = null;

function drawBoundingBox() {
    const verticalKm = parseFloat(document.getElementById("verticalDistance").value) || 0;
    const horizontalKm = parseFloat(document.getElementById("horizontalDistance").value) || 0;

    if (verticalKm === 0 || horizontalKm === 0) {
        alert("Please enter valid distances.");
        return;
    }

    // Remove existing rectangle if present
    if (currentRectangle) {
        currentRectangle.setMap(null);
    }

    // Conversion factors: 1 km ≈ 0.009 degrees latitude, 1 km ≈ 0.0113 degrees longitude
    const kmToLat = 0.009;
    const kmToLng = 0.0113;

    const currentCenter = map.getCenter();
    const latCenter = currentCenter.lat();
    const lngCenter = currentCenter.lng();

    // Calculate the rectangle bounds based on the distances in kilometers
    const northLat = latCenter + (verticalKm / 2) * kmToLat;
    const southLat = latCenter - (verticalKm / 2) * kmToLat;
    const eastLng = lngCenter + (horizontalKm / 2) * kmToLng;
    const westLng = lngCenter - (horizontalKm / 2) * kmToLng;

    // Define rectangle bounds
    bounds = {
        north: northLat,
        south: southLat,
        east: eastLng,
        west: westLng
    };

    // Draw the rectangle on the map (non-editable and non-draggable)
    currentRectangle = new google.maps.Rectangle({
        bounds: bounds,
        editable: false,  // Prevent dragging/resizing
        draggable: false, // Prevent movement
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0,
        map: map
    });
    map.fitBounds(bounds);
}    


function drawCircles(susceptible, infected, recovered, location) {
    // Check if the location is valid
    if (!location) return;

    // Extract latitude and longitude
    const centerLat = typeof location.lat === "function" ? location.lat() : location.lat;
    const centerLng = typeof location.lng === "function" ? location.lng() : location.lng;

    // Conversion factor: 1 km ≈ 0.009 degrees latitude, 1 km ≈ 0.0113 degrees longitude
    const kmToLat = 0.009;
    const kmToLng = 0.0113;

    // Function to create a circle on the map
    function createCircle(lat, lng, color) {
        const circle = new google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.8,
            map: map,
            center: { lat: lat, lng: lng },
            radius: 2 // Radius in meters, adjust as needed
        });
        allCircles.push(circle);
    }

    // Function to generate exponentially decaying offsets
    function generateGaussianOffset(maxDistance) {
        const standardDeviation = maxDistance / 3; // 99.7% of points fall within maxDistance (3σ rule)

        // Generate random values with a normal (Gaussian) distribution
        function sampleNormalDistribution() {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2); // Box-Muller transform
            return z0; // Standard normal variable (mean = 0, std = 1)
        }

        const distance = Math.abs(sampleNormalDistribution() * standardDeviation); // Scale by std dev and ensure non-negative
        const angle = Math.random() * 2 * Math.PI; // Random angle

        const latOffset = distance * Math.cos(angle) * kmToLat;
        const lngOffset = distance * Math.sin(angle) * kmToLng;

        return { latOffset, lngOffset };
    }

    // Maximum distance for decay (in km)
    const maxDistance = .1;

    // Add circles for infected (red)
    for (let i = 0; i < infected; i++) {
        const { latOffset, lngOffset } = generateGaussianOffset(maxDistance);
        createCircle(centerLat + latOffset, centerLng + lngOffset, "#FF0000");
    }

    // Add circles for susceptible (yellow)
    for (let i = 0; i < susceptible; i++) {
        const { latOffset, lngOffset } = generateGaussianOffset(maxDistance);
        createCircle(centerLat + latOffset, centerLng + lngOffset, "#ffb200");
    }

    // Add circles for recovered (blue)
    for (let i = 0; i < recovered; i++) {
        const { latOffset, lngOffset } = generateGaussianOffset(maxDistance);
        createCircle(centerLat + latOffset, centerLng + lngOffset, "#0000FF");
    }
}

function drawStayAtHomers(susceptible, infected, recovered, bounds) {
    // Check if the bounds are valid
    if (!bounds || typeof bounds.north !== "number" || typeof bounds.south !== "number" ||
        typeof bounds.east !== "number" || typeof bounds.west !== "number") {
        alert("Please provide valid bounds with north, south, east, and west properties.");
        return;
    }

    // Function to generate a random latitude and longitude within the bounds
    function getRandomLocation() {
        const lat = Math.random() * (bounds.north - bounds.south) + bounds.south; // Random latitude
        const lng = Math.random() * (bounds.east - bounds.west) + bounds.west;   // Random longitude
        return { lat, lng };
    }

    // Function to create a circle on the map
    function createCircle(lat, lng, color) {
        const circle = new google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.8,
            map: map,
            center: { lat: lat, lng: lng },
            radius: 2 // Radius in meters, adjust as needed
        });
        allCircles.push(circle);
    }

    // Add circles for infected (red)
    for (let i = 0; i < infected; i++) {
        const { lat, lng } = getRandomLocation();
        createCircle(lat, lng, "#FF0000");
    }

    // Add circles for susceptible (yellow)
    for (let i = 0; i < susceptible; i++) {
        const { lat, lng } = getRandomLocation();
        createCircle(lat, lng, "#ffb200");
    }

    // Add circles for recovered (blue)
    for (let i = 0; i < recovered; i++) {
        const { lat, lng } = getRandomLocation();
        createCircle(lat, lng, "#0000FF");
    }
}

document.getElementById("toggleControls").addEventListener("click", function() {
    const controls = document.getElementById("controls");
    const chartContainer = document.getElementById("sirGraphContainer");
    const timer = document.getElementById("timer");
   
    if (controls.classList.contains("collapsed")) {
        controls.classList.remove("collapsed");
        chartContainer.style.display = "none";
        timer.style.display = "none";
        this.textContent = "−";
    } else {
        controls.classList.add("collapsed");
        chartContainer.style.display = "block";
        timer.style.display = "block";
        this.textContent = "+";
    }
});

// handler (user-input) functions (empty for now - to add backend updates)

function handleMaskMandate() {
    fetch(`${BACKEND_URL}/activate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({protocol: "mask"})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Protocol updated:", data);
    })
    .catch(error => console.error("Error running simulation:", error));
}

function handleSchoolsClosed() {
    fetch(`${BACKEND_URL}/activate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({protocol: "school"})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Protocol updated:", data);
    })
    .catch(error => console.error("Error running simulation:", error));
}

function handleWorkFromHome() {
    fetch(`${BACKEND_URL}/activate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({protocol: "work"})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Protocol updated:", data);
    })
    .catch(error => console.error("Error running simulation:", error));
}

function handleLockdown() {
    fetch(`${BACKEND_URL}/activate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({protocol: "lockdown"})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Protocol updated:", data);
    })
    .catch(error => console.error("Error running simulation:", error));
}

function handleHospitalize() {
    fetch(`${BACKEND_URL}/activate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({protocol: "hospital"})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Protocol updated:", data);
    })
    .catch(error => console.error("Error running simulation:", error));
}

document.getElementById("maskMandate").addEventListener("change", handleMaskMandate);
document.getElementById("schoolsClosed").addEventListener("change", handleSchoolsClosed);
document.getElementById("workFromHome").addEventListener("change", handleWorkFromHome);
document.getElementById("lockdown").addEventListener("change", handleLockdown);
document.getElementById("hospital").addEventListener("change", handleHospitalize);


// Load Google Maps API with Places and Geometry libraries
const GOOGLE_MAPS_API_KEY = "AIzaSyDc1RJKVZuU0tqeZcW4q558ltBa7W857fA";
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async&callback=initMap`;
script.async = true;
document.head.appendChild(script);
const BACKEND_URL = "https://pandemicsim.onrender.com";